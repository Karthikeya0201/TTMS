"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Save, Edit } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getCurrentPeriod, hasTimeSlot } from "@/utils/timeUtils";
import { APIResponse, Batch, Branch, Classroom, Faculty, Section, Semester, SlotData, Subject, TimeSlot, TimetableEntry } from "@/types/timetable";

// Timetable data type
type TimetableData = { [slotKey: string]: SlotData & { entryId?: string } };

export default function CreateTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotData, setSlotData] = useState<{
    subject: string;
    faculty: string;
    classroom: string;
    entryId?: string;
  }>({
    subject: "",
    faculty: "",
    classroom: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [assignLoading, setAssignLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null);
  const router = useRouter();

  const API_BASE_URL = "https://ttms.onrender.com/api";
  const currentDay = "Sunday"; // June 1, 2025
  const currentTime = new Date("2025-06-01T21:18:00+05:30"); // 9:18 PM IST

  // Configure Axios with auth header
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: (status) => status >= 200 && status < 500,
  });

  // Add interceptor to include token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth-token");
      if (token && config.url?.startsWith("/timetable")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate. Please log in.",
        variant: "destructive",
      });
      router.push("/");
      return Promise.reject(error);
    }
  );

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoints = [
          "/batches",
          "/branches",
          "/semesters",
          "/sections",
          "/subjects",
          "/faculties",
          "/classrooms",
          "/timeslots",
        ];
        const responses = await Promise.all(
          endpoints.map((endpoint) => axiosInstance.get<APIResponse<any>>(endpoint))
        );

        const setters = [
          setBatches,
          setBranches,
          setSemesters,
          setSections,
          setSubjects,
          setFaculties,
          setClassrooms,
          setTimeSlots,
        ];
        const names = [
          "batches",
          "branches",
          "semesters",
          "sections",
          "subjects",
          "faculties",
          "classrooms",
          "time slots",
        ];

        const missingData: string[] = [];
        responses.forEach((res, index) => {
          if (!res.data.success) {
            throw new Error(res.data.message || `Failed to fetch ${names[index]}`);
          }
          const data = res.data.data || [];
          setters[index](data);
          if (!data.length) {
            missingData.push(names[index]);
          }
        });

        console.log("Master data fetched:", {
          batches: batches.length,
          branches: branches.length,
          semesters: semesters.length,
          sections: sections.length,
          subjects: subjects.length,
          faculties: faculties.length,
          classrooms: classrooms.length,
          timeSlots: timeSlots.length,
        });

        if (missingData.length > 0) {
          const errorMessage = `Missing data: ${missingData.join(", ")}. Please ensure backend data is populated.`;
          setError(errorMessage);
          toast({
            title: "Warning",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch master data";
        console.error(`Error fetching master data: ${errorMessage}`, err);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Determine current period
  useEffect(() => {
    setCurrentPeriod(getCurrentPeriod(timeSlots, currentDay, currentTime));
  }, [timeSlots]);

  // Reset dependent selections when batch or branch changes
  useEffect(() => {
    setSelectedSemester("");
    setSelectedSection("");
    setTimetableData({});
  }, [selectedBatch, selectedBranch]);

  // Reset section when semester changes
  useEffect(() => {
    setSelectedSection("");
    setTimetableData({});
  }, [selectedSemester]);

  // Fetch timetable data
  const fetchTimetable = useCallback(async () => {
    if (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection) {
      setTimetableData({});
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching timetable with params:", {
        batch: selectedBatch,
        branch: selectedBranch,
        semester: selectedSemester,
        section: selectedSection,
      });
      const res = await axiosInstance.get<APIResponse<TimetableEntry[]>>(
        `/timetable/filter`,
        {
          params: {
            batch: selectedBatch,
            branch: selectedBranch,
            semester: selectedSemester,
            section: selectedSection,
          },
        }
      );
      console.log("Timetable API response:", res.data);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch timetable");
      }
      const entries = res.data.data || [];
      console.log("Timetable entries:", entries);

      const timetable: TimetableData = {};
      entries.forEach((entry) => {
        const timeSlot = timeSlots.find((ts) => ts._id === (entry.timeSlot?._id || entry.timeSlot));
        const subject = subjects.find((s) => s._id === (entry.subject?._id || entry.subject));
        const faculty = faculties.find((f) => f._id === (entry.faculty?._id || entry.faculty));
        const classroom = classrooms.find((c) => c._id === (entry.classroom?._id || entry.classroom));

        if (!timeSlot || !subject || !faculty || !classroom) {
          console.warn(`Skipping entry due to missing reference data:`, {
            entryId: entry._id,
            timeSlot: !!timeSlot,
            timeSlotId: entry.timeSlot?._id || entry.timeSlot,
            subject: !!subject,
            subjectId: entry.subject?._id || entry.subject,
            faculty: !!faculty,
            facultyId: entry.faculty?._id || entry.faculty,
            classroom: !!classroom,
            classroomId: entry.classroom?._id || entry.classroom,
          });
          return;
        }

        const slotKey = `${timeSlot.day}-${timeSlot.period}`;
        timetable[slotKey] = {
          subject: subject._id,
          subjectName: subject.name,
          subjectCode: subject.code,
          faculty: faculty._id,
          facultyName: faculty.name,
          classroom: classroom._id,
          classroomName: classroom.name,
          entryId: entry._id,
        };
      });
      console.log("Processed timetable data:", timetable);
      setTimetableData(timetable);
      setConflicts([]);
      setError(entries.length === 0 ? "No timetable entries found for the selected criteria." : null);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch timetable";
      console.error(`Error fetching timetable: ${errorMessage}`, err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedBranch, selectedSemester, selectedSection, timeSlots, subjects, faculties, classrooms]);

  // Trigger fetchTimetable when selections are complete
  useEffect(() => {
    if (selectedBatch && selectedBranch && selectedSemester && selectedSection) {
      fetchTimetable();
    } else {
      setTimetableData({});
    }
  }, [selectedBatch, selectedBranch, selectedSemester, selectedSection, fetchTimetable]);

  // Derived data
  const days = useMemo(() => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], []);
  const periods = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const getId = (item: string | { _id: string } | null): string | null => {
    if (!item) return null;
    return typeof item === "string" ? item : item._id;
  };

  const filteredSemesters = useMemo(() => {
    console.log("Filtering semesters for batch:", selectedBatch, "branch:", selectedBranch);
    return semesters.filter((semester) => {
      const semesterBatchId = getId(semester.batch);
      const semesterBranchId = getId(semester.branch);
      return semesterBatchId === selectedBatch && semesterBranchId === selectedBranch;
    });
  }, [semesters, selectedBatch, selectedBranch]);

  const filteredSections = useMemo(() => {
    console.log("Filtering sections for semester:", selectedSemester);
    return sections.filter((section) => {
      const sectionSemesterId = getId(section.semester);
      return sectionSemesterId === selectedSemester;
    });
  }, [sections, selectedSemester]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const subjectSemesterId = getId(subject.semester);
      return subjectSemesterId === selectedSemester;
    });
  }, [subjects, selectedSemester]);

  const filteredFaculties = useMemo(() => {
    return slotData.subject
      ? faculties.filter((faculty) => {
          const facultySubjects = faculty.subjects.map((s) => (typeof s === "string" ? s : s._id));
          return facultySubjects.includes(slotData.subject);
        })
      : [];
  }, [faculties, slotData.subject]);

  const checkConflicts = async (timeSlotId: string, faculty: string, classroom: string, entryId?: string): Promise<string[]> => {
    try {
      const res = await axiosInstance.post<APIResponse<{ conflicts: string[] }>>("/timetable/check-conflicts", {
        timeSlot: timeSlotId,
        faculty,
        classroom,
        excludeEntryId: entryId, // Exclude the current entry when editing
      });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to check conflicts");
      }
      return res.data.data.conflicts || [];
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error(`Error checking conflicts: ${error.message}`, err);
      throw new Error(error.response?.data?.message || error.message || "Failed to check conflicts");
    }
  };

  const assignSlot = async () => {
    if (!selectedSlot || !slotData.subject || !slotData.faculty || !slotData.classroom || !selectedSection) {
      toast({
        title: "Validation Error",
        description: "Please select a time slot, subject, faculty, classroom, and section.",
        variant: "destructive",
      });
      return;
    }

    const timeSlot = timeSlots.find((ts) => `${ts.day}-${ts.period}` === selectedSlot);
    if (!timeSlot) {
      toast({
        title: "Validation Error",
        description: "Invalid time slot selected.",
        variant: "destructive",
      });
      return;
    }

    const subjectExists = subjects.find((s) => s._id === slotData.subject);
    const facultyExists = faculties.find((f) => f._id === slotData.faculty);
    const classroomExists = classrooms.find((c) => c._id === slotData.classroom);
    if (!subjectExists || !facultyExists || !classroomExists) {
      toast({
        title: "Validation Error",
        description: "Selected subject, faculty, or classroom is invalid.",
        variant: "destructive",
      });
      return;
    }

    setAssignLoading(true);
    try {
      const slotConflicts = await checkConflicts(timeSlot._id, slotData.faculty, slotData.classroom, slotData.entryId);
      if (slotConflicts.length > 0) {
        setConflicts(slotConflicts);
        toast({
          title: "Conflict Detected",
          description: "There are conflicts with the selected faculty or classroom.",
          variant: "destructive",
        });
        return;
      }

      const entry = {
        section: selectedSection,
        subject: slotData.subject,
        faculty: slotData.faculty,
        classroom: slotData.classroom,
        timeSlot: timeSlot._id,
      };

      // If editing, update the existing entry
      const res = slotData.entryId
        ? await axiosInstance.put<APIResponse<TimetableEntry>>(`/timetable/${slotData.entryId}`, entry)
        : await axiosInstance.post<APIResponse<TimetableEntry[]>>("/timetable", { entries: [entry] });

      if (!res.data.success) {
        throw new Error(res.data.message || `Failed to ${slotData.entryId ? 'update' : 'assign'} timetable slot`);
      }

      setTimetableData((prev) => ({
        ...prev,
        [selectedSlot]: {
          subject: slotData.subject,
          subjectName: subjectExists.name,
          subjectCode: subjectExists.code,
          faculty: slotData.faculty,
          facultyName: facultyExists.name,
          classroom: slotData.classroom,
          classroomName: classroomExists.name,
          entryId: slotData.entryId || res.data.data[0]?._id || res.data.data._id,
        },
      }));

      toast({
        title: "Success",
        description: `Slot for ${timeSlot.day}, Period ${timeSlot.period} ${slotData.entryId ? 'updated' : 'assigned'} successfully.`,
        variant: "default",
      });

      setSelectedSlot(null);
      setSlotData({ subject: "", faculty: "", classroom: "", entryId: undefined });
      setConflicts([]);
      await fetchTimetable(); // Refresh timetable to ensure latest data
    } catch (err) {
      const error = err as Error;
      console.error(`Error ${slotData.entryId ? 'updating' : 'assigning'} slot: ${error.message}`, err);
      toast({
        title: `${slotData.entryId ? 'Update' : 'Assignment'} Failed`,
        description: error.message || `Failed to ${slotData.entryId ? 'update' : 'assign'} timetable slot.`,
        variant: "destructive",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const saveTimetable = async () => {
    if (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection) {
      toast({
        title: "Validation Error",
        description: "Please select all criteria (batch, branch, semester, and section).",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(timetableData).length === 0) {
      toast({
        title: "Validation Error",
        description: "No timetable entries to save.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const entries = Object.entries(timetableData)
        .map(([slotKey, data]) => {
          const timeSlot = timeSlots.find((ts) => `${ts.day}-${ts.period}` === slotKey);
          if (!timeSlot) return null;
          return {
            section: selectedSection,
            subject: data.subject,
            faculty: data.faculty,
            classroom: data.classroom,
            timeSlot: timeSlot._id,
            _id: data.entryId,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      if (entries.length === 0) {
        throw new Error("No valid timetable entries to save");
      }

      const res = await axiosInstance.post<APIResponse<TimetableEntry[]>>("/timetable", { entries });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to save timetable");
      }

      toast({
        title: "Success",
        description: "Timetable saved successfully.",
        variant: "default",
      });

      await fetchTimetable();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || "Failed to save timetable";
      console.error(`Error saving timetable: ${errorMessage}`, err);
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSlotKey = (day: string, period: number) => `${day}-${period}`;

  const periodTimings: { [key: number]: string } = {
    1: "9:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:15 - 12:15",
    4: "12:15 - 1:15",
    5: "2:15 - 3:15",
    6: "3:15 - 4:15",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && (
        <div className="flex justify-center items-center fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-lg font-medium text-gray-900">Loading...</p>
          </div>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Timetable</h1>
        <p className="text-gray-600">Create and assign timetables with automatic conflict detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Selection Criteria</CardTitle>
              <CardDescription>Select the batch, branch, semester, and section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batch">Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger id="batch">
                    <SelectValue placeholder={batches.length === 0 ? "No batches available" : "Select batch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.length === 0 ? (
                      <SelectItem value="no-batches" disabled>No batches available</SelectItem>
                    ) : (
                      batches.map((batch) => (
                        <SelectItem key={batch._id} value={batch._id}>
                          {batch.name} ({batch.startYear}-{batch.endYear})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder={branches.length === 0 ? "No branches available" : "Select branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length === 0 ? (
                      <SelectItem value="no-branches" disabled>No branches available</SelectItem>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name} ({branch.branchCode})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="semester">
                    <SelectValue
                      placeholder={
                        semesters.length === 0
                          ? "No semesters available"
                          : filteredSemesters.length === 0
                          ? selectedBatch && selectedBranch
                            ? "No semesters for selected batch and branch"
                            : "Select batch and branch first"
                          : "Select semester"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.length === 0 ? (
                      <SelectItem value="no-semesters" disabled>No semesters available</SelectItem>
                    ) : filteredSemesters.length === 0 ? (
                      <SelectItem value="no-match" disabled>
                        No semesters for selected batch and branch
                      </SelectItem>
                    ) : (
                      filteredSemesters.map((semester) => (
                        <SelectItem key={semester._id} value={semester._id}>
                          {semester.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger id="section">
                    <SelectValue
                      placeholder={
                        filteredSections.length === 0
                          ? selectedSemester
                            ? "No sections for selected semester"
                            : "Select semester first"
                          : "Select section"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSections.length === 0 ? (
                      <SelectItem value="no-sections" disabled>
                        {selectedSemester ? "No sections for selected semester" : "Select semester first"}
                      </SelectItem>
                    ) : (
                      filteredSections.map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedSlot && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">
                    {slotData.entryId ? "Edit" : "Assign"} Slot: {selectedSlot.replace("-", ", Period ")}
                  </h4>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={slotData.subject}
                      onValueChange={(value) => setSlotData({ ...slotData, subject: value, faculty: "" })}
                      disabled={assignLoading}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubjects.length === 0 ? (
                          <SelectItem value="no-subjects" disabled>
                            No subjects available for this semester
                          </SelectItem>
                        ) : (
                          filteredSubjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="faculty">Faculty</Label>
                    <Select
                      value={slotData.faculty}
                      onValueChange={(value) => setSlotData({ ...slotData, faculty: value })}
                      disabled={assignLoading || !slotData.subject}
                    >
                      <SelectTrigger id="faculty">
                        <SelectValue placeholder={slotData.subject ? "Select faculty" : "Select a subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFaculties.length === 0 ? (
                          slotData.subject ? (
                            <SelectItem value="no-faculty" disabled>
                              No faculty assigned to selected subject
                            </SelectItem>
                          ) : (
                            <SelectItem value="no-subject" disabled>
                              Select a subject first
                            </SelectItem>
                          )
                        ) : (
                          filteredFaculties.map((faculty) => (
                            <SelectItem key={faculty._id} value={faculty._id}>
                              {faculty.name} ({faculty.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="classroom">Classroom</Label>
                    <Select
                      value={slotData.classroom}
                      onValueChange={(value) => setSlotData({ ...slotData, classroom: value })}
                      disabled={assignLoading}
                    >
                      <SelectTrigger id="classroom">
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.length === 0 ? (
                          <SelectItem value="no-classrooms" disabled>
                            No classrooms available
                          </SelectItem>
                        ) : (
                          classrooms.map((classroom) => (
                            <SelectItem key={classroom._id} value={classroom._id}>
                              {classroom.name} (Capacity: {classroom.capacity})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {conflicts.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {conflicts.map((conflict, index) => (
                            <li key={index}>{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={assignSlot} className="flex-1" disabled={assignLoading}>
                      {assignLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4">
                            <svg viewBox="0 0 24 24" className="w-4 h-4">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                          {slotData.entryId ? "Updating..." : "Assigning..."}
                        </div>
                      ) : (
                        <>
                          {slotData.entryId ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Update
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Assign
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSlot(null);
                        setSlotData({ subject: "", faculty: "", classroom: "", entryId: undefined });
                        setConflicts([]);
                      }}
                      disabled={assignLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                {selectedBatch && selectedBranch && selectedSemester && selectedSection ? (
                  `${branches.find((b) => b._id === selectedBranch)?.name || "Unknown"} - ${
                    semesters.find((s) => s._id === selectedSemester)?.name || "Unknown"
                  } - Section ${sections.find((s) => s._id === selectedSection)?.name || "Unknown"} (${
                    batches.find((b) => b._id === selectedBatch)?.name || "Unknown"
                  })`
                ) : (
                  "Select criteria to view timetable"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBatch && selectedBranch && selectedSemester && selectedSection ? (
                <>
                  {timeSlots.length === 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No time slots defined. Contact admin to add time slots for accurate scheduling.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50">Day</th>
                          {periods.map((period) => (
                            <th
                              key={period}
                              className={`border border-gray-300 p-2 bg-gray-50 min-w-[150px] ${
                                period === currentPeriod && hasTimeSlot(currentDay, period, timeSlots)
                                  ? "bg-blue-200"
                                  : ""
                              }`}
                            >
                              <div className="text-sm">{periodTimings[period] || "Unknown"}</div>
                              <div className="text-xs text-gray-500">Period {period}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {days.map((day) => (
                          <tr key={day}>
                            <td
                              className={`border border-gray-300 p-2 font-medium bg-gray-50 ${
                                day === currentDay ? "bg-blue-100" : ""
                              }`}
                            >
                              {day}
                            </td>
                            {periods.map((period) => {
                              const slotKey = getSlotKey(day, period);
                              const slotInfo = timetableData[slotKey];
                              const slotExists = hasTimeSlot(day, period, timeSlots);
                              return (
                                <td
                                  key={slotKey}
                                  className={`border border-gray-300 p-2 ${
                                    slotExists
                                      ? "cursor-pointer hover:bg-gray-100 transition-colors"
                                      : "bg-gray-200 cursor-not-allowed"
                                  } ${
                                    day === currentDay && period === currentPeriod && slotExists
                                      ? "bg-blue-200"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    if (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection) {
                                      toast({
                                        title: "Error",
                                        description: "Please select all criteria before assigning slots.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    if (!slotExists) {
                                      toast({
                                        title: "Error",
                                        description: `No time slot defined for ${day}, Period ${period}. Please contact the admin to add this time slot.`,
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    setSelectedSlot(slotKey);
                                    setSlotData({
                                      subject: slotInfo?.subject || "",
                                      faculty: slotInfo?.faculty || "",
                                      classroom: slotInfo?.classroom || "",
                                      entryId: slotInfo?.entryId,
                                    });
                                  }}
                                >
                                  {slotExists ? (
                                    slotInfo ? (
                                      <div className="space-y-1">
                                        <Badge variant="default" className="text-xs">
                                          {slotInfo.subjectCode}
                                        </Badge>
                                        <div className="text-xs text-gray-600">{slotInfo.facultyName}</div>
                                        <div className="text-xs text-gray-500">{slotInfo.classroomName}</div>
                                      </div>
                                    ) : (
                                      <div className="text-center text-gray-400 text-sm">Click to assign</div>
                                    )
                                  ) : (
                                    <div className="text-center text-gray-500 text-sm">No time slot</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(selectedBatch && selectedBranch && selectedSemester && selectedSection) && (
                    <div className="mt-6 flex justify-end space-x-2">
                      <Button onClick={fetchTimetable} disabled={loading}>
                        Refresh Timetable
                      </Button>
                      <Button onClick={saveTimetable} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Timetable
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select batch, branch, semester, and section to create timetable
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
