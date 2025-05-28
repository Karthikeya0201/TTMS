"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Save } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";

// Interfaces aligned with backend schemas
interface Batch {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface Branch {
  _id: string;
  name: string;
  branchCode: string;
}

interface Semester {
  _id: string;
  name: string;
  branch: string | Branch;
  batch: string | Batch;
}

interface Section {
  _id: string;
  name: string;
  semester: string | Semester;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  semester: string | { _id: string; name: string };
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  subjects: string[] | Subject[];
}

interface Classroom {
  _id: string;
  name: string;
  capacity: number;
}

interface TimeSlot {
  _id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
}

interface TimetableEntry {
  _id: string;
  section: string;
  subject: string;
  faculty: string;
  classroom: string;
  timeSlot: string;
  createdAt?: string;
  updatedAt?: string;
}

interface APIResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

interface SlotData {
  subject: string;
  subjectName: string;
  subjectCode: string;
  faculty: string;
  facultyName: string;
  classroom: string;
  classroomName: string;
}

type TimetableData = { [slotKey: string]: SlotData };

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

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const currentDay = "Wednesday";
  const currentTime = new Date("2025-05-28T22:32:00+05:30"); // Updated to 10:32 PM IST

  // Configure Axios with auth header
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: (status) => status >= 200 && status < 500,
  });

  // Add interceptor to include token in requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("No authentication token found. Please log in.");
      }
      return config;
    },
    (error) => {
      console.error("Axios Request Interceptor Error:", error);
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
        position: "top-center",
      });
      router.push("/login");
      return Promise.reject(error);
    }
  );

  // Fetch master data from backend
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          batchesRes,
          branchesRes,
          semestersRes,
          sectionsRes,
          subjectsRes,
          facultiesRes,
          classroomsRes,
          timeSlotsRes,
        ] = await Promise.all([
          axiosInstance.get("/batches"),
          axiosInstance.get("/branches"),
          axiosInstance.get("/semesters"),
          axiosInstance.get("/sections"),
          axiosInstance.get("/subjects"),
          axiosInstance.get("/faculties"),
          axiosInstance.get("/classrooms"),
          axiosInstance.get("/timeslots"),
        ]);

        const fetchedBatches = batchesRes.data?.data || batchesRes.data || [];
        const fetchedBranches = branchesRes.data?.data || branchesRes.data || [];
        const fetchedSemesters = semestersRes.data?.data || semestersRes.data || [];
        const fetchedSections = sectionsRes.data?.data || sectionsRes.data || [];
        const fetchedSubjects = subjectsRes.data?.data || subjectsRes.data || [];
        const fetchedFaculties = facultiesRes.data?.data || facultiesRes.data || [];
        const fetchedClassrooms = classroomsRes.data?.data || classroomsRes.data || [];
        const fetchedTimeSlots = timeSlotsRes.data?.data || timeSlotsRes.data || [];

        setBatches(fetchedBatches);
        setBranches(fetchedBranches);
        setSemesters(fetchedSemesters);
        setSections(fetchedSections);
        setSubjects(fetchedSubjects);
        setFaculties(fetchedFaculties);
        setClassrooms(fetchedClassrooms);
        setTimeSlots(
          fetchedTimeSlots.sort((a: TimeSlot, b: TimeSlot) => {
            if (a.day === b.day) return a.period - b.period;
            return days.indexOf(a.day) - days.indexOf(b.day);
          })
        );

        if (
          !fetchedBatches.length ||
          !fetchedBranches.length ||
          !fetchedSemesters.length ||
          !fetchedSections.length ||
          !fetchedSubjects.length ||
          !fetchedFaculties.length ||
          !fetchedClassrooms.length ||
          !fetchedTimeSlots.length
        ) {
          const missingData = [];
          if (!fetchedBatches.length) missingData.push("batches");
          if (!fetchedBranches.length) missingData.push("branches");
          if (!fetchedSemesters.length) missingData.push("semesters");
          if (!fetchedSections.length) missingData.push("sections");
          if (!fetchedSubjects.length) missingData.push("subjects");
          if (!fetchedFaculties.length) missingData.push("faculties");
          if (!fetchedClassrooms.length) missingData.push("classrooms");
          if (!fetchedTimeSlots.length) missingData.push("time slots");
          toast({
            title: "Warning",
            description: `Missing critical data: ${missingData.join(", ")}. Please ensure backend data is populated.`,
            variant: "destructive",
            position: "top-center",
          });
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to fetch master data";
        console.error("Fetch Master Data Error:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          position: "top-center",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Determine the current period based on timeSlots
  useEffect(() => {
    if (timeSlots.length > 0) {
      const todaySlots = timeSlots.filter((slot) => slot.day === currentDay);
      const period = todaySlots.find((slot) => {
        try {
          const start = new Date(`2025-05-28T${slot.startTime}:00+05:30`);
          const end = new Date(`2025-05-28T${slot.endTime}:00+05:30`);
          return currentTime >= start && currentTime <= end;
        } catch (error) {
          console.error("Error parsing time slot:", error);
          return false;
        }
      });
      setCurrentPeriod(period ? period.period : null);
    } else {
      setCurrentPeriod(null);
    }
  }, [timeSlots, currentDay, currentTime]);

  // Reset dependent selections
  useEffect(() => {
    setSelectedSemester("");
    setSelectedSection("");
    setTimetableData({});
  }, [selectedBatch, selectedBranch]);

  useEffect(() => {
    setSelectedSection("");
    setTimetableData({});
  }, [selectedSemester]);

  // Fetch timetable data when selection criteria change
  useEffect(() => {
    if (selectedBatch && selectedBranch && selectedSemester && selectedSection) {
      const fetchTimetable = async () => {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/timetable/section/${selectedSection}`);
          if (!res.data.success && res.status !== 200) {
            throw new Error(res.data.message || "Failed to fetch timetable");
          }
          const entries: TimetableEntry[] = res.data?.data || res.data || [];
          const timetable: TimetableData = {};
          entries.forEach((entry) => {
            const timeSlot = timeSlots.find((ts) => ts._id === entry.timeSlot);
            if (timeSlot) {
              const slotKey = `${timeSlot.day}-${timeSlot.period}`;
              const subject = subjects.find((s) => s._id === entry.subject);
              const faculty = faculties.find((f) => f._id === entry.faculty);
              const classroom = classrooms.find((c) => c._id === entry.classroom);
              timetable[slotKey] = {
                subject: entry.subject,
                subjectName: subject?.name || "Unknown",
                subjectCode: subject?.code || "Unknown",
                faculty: entry.faculty,
                facultyName: faculty?.name || "Unknown",
                classroom: entry.classroom,
                classroomName: classroom?.name || "Unknown",
              };
            }
          });
          setTimetableData(timetable);
          setConflicts([]);
        } catch (err: unknown) {
          const error = err as AxiosError<{ message?: string }>;
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch timetable";
          console.error("Fetch Timetable Error:", errorMessage);
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
            position: "top-center",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchTimetable();
    }
  }, [selectedBatch, selectedBranch, selectedSemester, selectedSection, timeSlots, subjects, faculties, classrooms]);

  // Helper to extract ID from batch, branch, semester, or subject
  const getId = (item: string | { _id: string } | null): string | null => {
    if (!item) return null;
    return typeof item === "string" ? item : item._id;
  };

  // Filter semesters by selected batch and branch
  const filteredSemesters = semesters.filter((semester) => {
    const semesterBatchId = getId(semester.batch);
    const semesterBranchId = getId(semester.branch);
    return semesterBatchId === selectedBatch && semesterBranchId === selectedBranch;
  });

  // Filter sections by selected semester
  const filteredSections = sections.filter((section) => {
    const sectionSemesterId = getId(section.semester);
    return sectionSemesterId === selectedSemester;
  });

  // Filter subjects by selected semester
  const filteredSubjects = subjects.filter((subject) => {
    const subjectSemesterId = getId(subject.semester);
    return subjectSemesterId === selectedSemester;
  });

  // Filter faculties by selected subject
  const filteredFaculties = slotData.subject
    ? faculties.filter((faculty) => {
        const facultySubjects = faculty.subjects.map((s) =>
          typeof s === "string" ? s : s._id
        );
        return facultySubjects.includes(slotData.subject);
      })
    : [];

  // Dynamically determine days and periods from timeSlots, with defaults if timeSlots is empty
  const days = timeSlots.length > 0
    ? Array.from(new Set(timeSlots.map((slot) => slot.day))).sort(
        (a, b) =>
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(a) -
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(b)
      )
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const periods = timeSlots.length > 0
    ? Array.from(new Set(timeSlots.map((slot) => slot.period))).sort((a, b) => a - b)
    : [1, 2, 3, 4, 5];

  const checkConflicts = async (
    timeSlotId: string,
    faculty: string,
    classroom: string
  ): Promise<string[]> => {
    try {
      const res = await axiosInstance.post("/timetable/check-conflicts", {
        timeSlot: timeSlotId,
        faculty,
        classroom,
      });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to check conflicts");
      }
      return res.data.data?.conflicts || [];
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || "Failed to check conflicts";
      console.error("Check Conflicts Error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const assignSlot = async () => {
    console.log("Assign Slot Called:", { selectedSlot, slotData, selectedSection });

    if (!selectedSlot || !slotData.subject || !slotData.faculty || !slotData.classroom) {
      console.log("Validation Failed: Missing slot details");
      toast({
        title: "Validation Error",
        description: "Please fill all slot details (subject, faculty, and classroom).",
        variant: "destructive",
        position: "top-center",
      });
      return;
    }

    if (!selectedSection) {
      console.log("Validation Failed: No section selected");
      toast({
        title: "Validation Error",
        description: "Please select a section before assigning a slot.",
        variant: "destructive",
        position: "top-center",
      });
      return;
    }

    if (timeSlots.length === 0) {
      console.log("Validation Failed: No time slots defined");
      toast({
        title: "Validation Error",
        description: "No time slots defined. Please contact the admin to add time slots.",
        variant: "destructive",
        position: "top-center",
      });
      return;
    }

    const timeSlot = timeSlots.find((ts) => `${ts.day}-${ts.period}` === selectedSlot);
    if (!timeSlot) {
      console.log("Validation Failed: Invalid time slot", selectedSlot);
      toast({
        title: "Validation Error",
        description: "Invalid time slot selected.",
        variant: "destructive",
        position: "top-center",
      });
      return;
    }

    setAssignLoading(true);
    try {
      console.log("Checking conflicts for:", { timeSlot: timeSlot._id, faculty: slotData.faculty, classroom: slotData.classroom });
      // Check for conflicts
      const slotConflicts = await checkConflicts(timeSlot._id, slotData.faculty, slotData.classroom);
      if (slotConflicts.length > 0) {
        console.log("Conflicts Found:", slotConflicts);
        setConflicts(slotConflicts);
        toast({
          title: "Conflict Detected",
          description: "There are conflicts with the selected faculty or classroom.",
          variant: "destructive",
          position: "top-center",
        });
        return;
      }

      // Prepare the timetable entry
      const entry = {
        section: selectedSection,
        subject: slotData.subject,
        faculty: slotData.faculty,
        classroom: slotData.classroom,
        timeSlot: timeSlot._id,
      };

      console.log("Sending timetable entry to backend:", entry);
      // Save the entry to the backend
      const res = await axiosInstance.post<APIResponse<TimetableEntry[]>>("/timetable", {
        entries: [entry],
      });

      console.log("Backend Response:", res.data);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to assign timetable slot");
      }

      // Update local timetable data with full details
      const subject = subjects.find((s) => s._id === slotData.subject);
      const faculty = faculties.find((f) => f._id === slotData.faculty);
      const classroom = classrooms.find((c) => c._id === slotData.classroom);

      setTimetableData((prev) => ({
        ...prev,
        [selectedSlot]: {
          subject: slotData.subject,
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
          faculty: slotData.faculty,
          facultyName: faculty?.name || "Unknown",
          classroom: slotData.classroom,
          classroomName: classroom?.name || "Unknown",
        },
      }));

      toast({
        title: "Success",
        description: `Slot for ${timeSlot.day}, Period ${timeSlot.period} assigned successfully.`,
        variant: "default",
        position: "top-center",
      });

      // Reset dialog state
      setSelectedSlot(null);
      setSlotData({ subject: "", faculty: "", classroom: "" });
      setConflicts([]);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Assign Slot Error:", error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign timetable slot.",
        variant: "destructive",
        position: "top-center",
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
        position: "top-center",
      });
      return;
    }

    if (timeSlots.length === 0) {
      toast({
        title: "Validation Error",
        description: "No time slots defined. Cannot save timetable.",
        variant: "destructive",
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
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
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      if (entries.length === 0) {
        toast({
          title: "Validation Error",
          description: "No valid timetable entries to save.",
          variant: "destructive",
          position: "top-center",
        });
        return;
      }

      const res = await axiosInstance.post<APIResponse<TimetableEntry[]>>("/timetable", { entries });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to save timetable");
      }

      toast({
        title: "Success",
        description: "Timetable saved successfully.",
        variant: "default",
        position: "top-center",
      });

      // Refresh timetable data
      const updatedRes = await axiosInstance.get<APIResponse<TimetableEntry[]>>(
        `/timetable/section/${selectedSection}`
      );
      if (!updatedRes.data.success) {
        throw new Error(updatedRes.data.message || "Failed to refresh timetable");
      }
      const updatedEntries = updatedRes.data?.data || [];
      const newTimetableData: TimetableData = {};
      updatedEntries.forEach((entry) => {
        const timeSlot = timeSlots.find((ts) => ts._id === entry.timeSlot);
        if (timeSlot) {
          const slotKey = `${timeSlot.day}-${timeSlot.period}`;
          const subject = subjects.find((s) => s._id === entry.subject);
          const faculty = faculties.find((f) => f._id === entry.faculty);
          const classroom = classrooms.find((c) => c._id === entry.classroom);
          newTimetableData[slotKey] = {
            subject: entry.subject,
            subjectName: subject?.name || "Unknown",
            subjectCode: subject?.code || "Unknown",
            faculty: entry.faculty,
            facultyName: faculty?.name || "Unknown",
            classroom: entry.classroom,
            classroomName: classroom?.name || "Unknown",
          };
        }
      });
      setTimetableData(newTimetableData);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || error.message || "Failed to save timetable";
      console.error("Save Timetable Error:", errorMessage);
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSlotKey = (day: string, period: number) => `${day}-${period}`;

  const getPeriodTime = (day: string, period: number) => {
    if (timeSlots.length === 0) {
      const defaultPeriods: Record<number, string> = {
        1: "09:00-10:00",
        2: "10:00-11:00",
        3: "11:15-12:00",
        4: "12:15-13:15",
        5: "14:30-15:30",
      };
      return defaultPeriods[period] || `Period ${period}`;
    }
    const slot = timeSlots.find((ts) => ts.day === day && ts.period === period);
    return slot ? `${slot.startTime}-${slot.endTime}` : `Period ${period} (No time slot)`;
  };

  const hasTimeSlot = (day: string, period: number) => {
    if (timeSlots.length === 0) return true;
    return timeSlots.some((ts) => ts.day === day && ts.period === period);
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
                    <SelectValue
                      placeholder={batches.length === 0 ? "No batches available" : "Select batch"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.length === 0 ? (
                      <SelectItem value="no-batches" disabled>
                        No batches available
                      </SelectItem>
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
                    <SelectValue
                      placeholder={branches.length === 0 ? "No branches available" : "Select branch"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length === 0 ? (
                      <SelectItem value="no-branches" disabled>
                        No branches available
                      </SelectItem>
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
                      <SelectItem value="no-semesters" disabled>
                        No semesters available
                      </SelectItem>
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

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBatch("");
                  setSelectedBranch("");
                  setSelectedSemester("");
                  setSelectedSection("");
                  setTimetableData({});
                  setSelectedSlot(null);
                  setSlotData({ subject: "", faculty: "", classroom: "" });
                  setConflicts([]);
                }}
                className="w-full"
              >
                Reset Selections
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                {selectedBatch && selectedBranch && selectedSemester && selectedSection
                  ? `${branches.find((b) => b._id === selectedBranch)?.name || "Unknown"} - ${
                      semesters.find((s) => s._id === selectedSemester)?.name || "Unknown"
                    } - Section ${sections.find((s) => s._id === selectedSection)?.name || "Unknown"} (${
                      batches.find((b) => b._id === selectedBatch)?.name || "Unknown"
                    })`
                  : "Select criteria to view timetable"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBatch && selectedBranch && selectedSemester && selectedSection ? (
                <>
                  {timeSlots.length === 0 && (
                    <Alert variant="warning" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No time slots defined. Using default periods. Please contact the admin to add time slots for accurate scheduling.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50">Time</th>
                          {days.map((day) => (
                            <th
                              key={day}
                              className={`border border-gray-300 p-2 bg-gray-50 min-w-[150px] ${
                                day === currentDay ? "bg-blue-100" : ""
                              }`}
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {periods.map((period) => (
                          <tr key={period}>
                            <td
                              className={`border border-gray-300 p-2 font-medium bg-gray-50 ${
                                period === currentPeriod && timeSlots.some((ts) => ts.day === currentDay && ts.period === period)
                                  ? "bg-blue-100"
                                  : ""
                              }`}
                            >
                              <div className="text-sm">{getPeriodTime(currentDay, period)}</div>
                              <div className="text-xs text-gray-500">Period {period}</div>
                            </td>
                            {days.map((day) => {
                              const slotKey = getSlotKey(day, period);
                              const slotInfo = timetableData[slotKey];
                              const slotExists = hasTimeSlot(day, period);
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
                                        position: "top-center",
                                      });
                                      return;
                                    }
                                    if (!slotExists) {
                                      toast({
                                        title: "Error",
                                        description: `No time slot defined for ${day}, Period ${period}. Please contact the admin to add this time slot.`,
                                        variant: "destructive",
                                        position: "top-center",
                                      });
                                      return;
                                    }
                                    setSelectedSlot(slotKey);
                                    if (slotInfo) {
                                      setSlotData({
                                        subject: slotInfo.subject,
                                        faculty: slotInfo.faculty,
                                        classroom: slotInfo.classroom,
                                      });
                                    } else {
                                      setSlotData({ subject: "", faculty: "", classroom: "" });
                                    }
                                  }}
                                >
                                  {slotExists ? (
                                    slotInfo ? (
                                      <div className="space-y-1">
                                        <Badge variant="default" className="text-xs">
                                          {slotInfo.subjectCode}
                                        </Badge>
                                        <div className="text-xs text-gray-600">
                                          {slotInfo.facultyName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {slotInfo.classroomName}
                                        </div>
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
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select batch, branch, semester, and section to create timetable
                </div>
              )}

              {Object.keys(timetableData).length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={saveTimetable} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Timetable
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for Slot Assignment */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Assign Slot: {selectedSlot.replace("-", ", Period ")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={slotData.subject}
                  onChange={(e) => {
                    setSlotData({ ...slotData, subject: e.target.value });
                    setConflicts([]);
                  }}
                  className="w-full border rounded-md p-2"
                  disabled={assignLoading}
                >
                  <option value="">Select Subject</option>
                  {filteredSubjects.length === 0 ? (
                    <option value="" disabled>
                      No subjects available for this semester
                    </option>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty *
                </label>
                <select
                  value={slotData.faculty}
                  onChange={(e) => {
                    setSlotData({ ...slotData, faculty: e.target.value });
                    setConflicts([]);
                  }}
                  className="w-full border rounded-md p-2"
                  disabled={assignLoading}
                >
                  <option value="">
                    {slotData.subject ? "Select Faculty" : "Select a subject first"}
                  </option>
                  {filteredFaculties.length === 0 ? (
                    slotData.subject && (
                      <option value="" disabled>
                        No faculty assigned to selected subject
                      </option>
                    )
                  ) : (
                    filteredFaculties.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom *
                </label>
                <select
                  value={slotData.classroom}
                  onChange={(e) => {
                    setSlotData({ ...slotData, classroom: e.target.value });
                    setConflicts([]);
                  }}
                  className="w-full border rounded-md p-2"
                  disabled={assignLoading}
                >
                  <option value="">Select Classroom</option>
                  {classrooms.length === 0 ? (
                    <option value="" disabled>
                      No classrooms available
                    </option>
                  ) : (
                    classrooms.map((classroom) => (
                      <option key={classroom._id} value={classroom._id}>
                        {classroom.name} (Capacity: {classroom.capacity})
                      </option>
                    ))
                  )}
                </select>
              </div>
              {conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <p className="font-medium">Conflicts Detected:</p>
                  </div>
                  <ul className="list-disc list-inside mt-2">
                    {conflicts.map((conflict, index) => (
                      <li key={index} className="text-sm">
                        {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setSlotData({ subject: "", faculty: "", classroom: "" });
                    setConflicts([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("Assign Button Clicked");
                    assignSlot();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    assignLoading ||
                    !slotData.subject ||
                    !slotData.faculty ||
                    !slotData.classroom
                  }
                >
                  {assignLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      Assigning...
                    </div>
                  ) : (
                    "Assign Slot"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}