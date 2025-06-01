"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Interfaces for backend data
interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Faculty {
  _id: string;
  name: string;
}

interface Classroom {
  _id: string;
  name: string;
}

interface Section {
  _id: string;
  name: string;
  semester: string | Semester;
}

interface Semester {
  _id: string;
  name: string;
  batch: string | Batch;
  branch: string | Branch;
}

interface Branch {
  _id: string;
  name: string;
  branchCode: string;
}

interface Batch {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
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
  section: string | Section;
  subject: string | Subject;
  faculty: string | Faculty;
  classroom: string | Classroom;
  timeSlot: string | TimeSlot;
}

interface SlotData {
  subject: string | Subject;
  faculty: string | Faculty;
  classroom: string | Classroom;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  classroomName: string;
}

type TimetableData = { [slotKey: string]: SlotData };

interface APIResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export default function ViewTimetablePage() {
  const [viewType, setViewType] = useState<string>("section");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>(""); // For faculty/classroom views
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFilterData, setLoadingFilterData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null);

  const router = useRouter();
  const API_BASE_URL = "https://ttms.onrender.com/api";
  const currentDay = "Sunday"; // June 01, 2025
  const currentTime = new Date("2025-06-01T23:56:00+05:30"); // 11:56 PM IST

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
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      router.push("/login");
      return Promise.reject(error);
    }
  );

  // Fetch master data from backend
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoadingFilterData(true);
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
          setFaculty,
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
          if (index === 7) {
            // Sort timeSlots
            data.sort((a: TimeSlot, b: TimeSlot) => {
              if (a.day === b.day) return a.period - b.period;
              return expectedDays.indexOf(a.day) - expectedDays.indexOf(b.day);
            });
          }
          setters[index](data);
          if (!data.length) {
            missingData.push(names[index]);
          }
        });

        if (missingData.length > 0) {
          toast({
            title: "Warning",
            description: `Missing data: ${missingData.join(", ")}. Please ensure the backend database is populated.`,
            variant: "destructive",
          });
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch master data";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setLoadingFilterData(false);
      }
    };
    fetchMasterData();
  }, []);

  // Dynamically determine days and periods from timeSlots
  const expectedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(timeSlots.map((slot) => slot.day))).filter((day) =>
      expectedDays.includes(day)
    );
    return uniqueDays.sort(
      (a, b) => expectedDays.indexOf(a) - expectedDays.indexOf(b)
    );
  }, [timeSlots]);

  const periods = useMemo(() => {
    const uniquePeriods = Array.from(new Set(timeSlots.map((slot) => slot.period))).filter(
      (period) => period >= 1 && period <= 6
    );
    return uniquePeriods.sort((a, b) => a - b);
  }, [timeSlots]);

  // Validate timeSlots data
  useEffect(() => {
    if (timeSlots.length > 0) {
      const invalidDays = timeSlots
        .map((slot) => slot.day)
        .filter((day) => !expectedDays.includes(day));
      const invalidPeriods = timeSlots
        .map((slot) => slot.period)
        .filter((period) => period < 1 || period > 6);

      if (invalidDays.length > 0 || invalidPeriods.length > 0) {
        const errorMessages = [];
        if (invalidDays.length > 0) {
          errorMessages.push(`Invalid days found: ${[...new Set(invalidDays)].join(", ")}. Expected: ${expectedDays.join(", ")}`);
        }
        if (invalidPeriods.length > 0) {
          errorMessages.push(`Invalid periods found: ${[...new Set(invalidPeriods)].join(", ")}. Expected: 1 to 6`);
        }
        setError(errorMessages.join("; "));
        toast({
          title: "Data Validation Error",
          description: errorMessages.join("; "),
          variant: "destructive",
        });
      }
    }
  }, [timeSlots]);

  // Determine the current period based on timeSlots
  useEffect(() => {
    if (timeSlots.length > 0) {
      const todaySlots = timeSlots.filter((slot) => slot.day === currentDay);
      const period = todaySlots.find((slot) => {
        try {
          const start = new Date(`2025-06-01T${slot.startTime}:00+05:30`);
          const end = new Date(`2025-06-01T${slot.endTime}:00+05:30`);
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
  }, [timeSlots, currentTime]);

  // Reset selections when viewType changes
  useEffect(() => {
    setSelectedBatch("");
    setSelectedBranch("");
    setSelectedSemester("");
    setSelectedSection("");
    setSelectedFilter("");
    setTimetableData({});
    setError(null);
  }, [viewType]);

  // Reset dependent selections for section view
  useEffect(() => {
    if (viewType === "section") {
      setSelectedSemester("");
      setSelectedSection("");
      setTimetableData({});
    }
  }, [selectedBatch, selectedBranch, viewType]);

  useEffect(() => {
    if (viewType === "section") {
      setSelectedSection("");
      setTimetableData({});
    }
  }, [selectedSemester, viewType]);

  // Fetch timetable data based on viewType
  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        let entries: TimetableEntry[] = [];
        if (viewType === "section") {
          if (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection) {
            setTimetableData({});
            return;
          }
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
          if (!res.data.success) {
            throw new Error(res.data.message || "Failed to fetch timetable");
          }
          entries = res.data.data || [];
        } else {
          if (!selectedFilter) {
            setTimetableData({});
            return;
          }
          const endpoint =
            viewType === "faculty"
              ? `/timetable/faculty/${selectedFilter}`
              : `/timetable/classroom/${selectedFilter}`;
          const res = await axiosInstance.get<APIResponse<TimetableEntry[]>>(endpoint);
          if (!res.data.success) {
            throw new Error(res.data.message || "Failed to fetch timetable");
          }
          entries = res.data.data || [];
        }

        const timetable: TimetableData = {};
        entries.forEach((entry) => {
          const timeSlot = typeof entry.timeSlot === "string" ? timeSlots.find((ts) => ts._id === entry.timeSlot) : entry.timeSlot;
          if (timeSlot) {
            const slotKey = `${timeSlot.day}-${timeSlot.period}`;
            const subject = typeof entry.subject === "string" ? subjects.find((s) => s._id === entry.subject) : entry.subject;
            const facultyEntry = typeof entry.faculty === "string" ? faculty.find((f) => f._id === entry.faculty) : entry.faculty;
            const classroom = typeof entry.classroom === "string" ? classrooms.find((c) => c._id === entry.classroom) : entry.classroom;
            timetable[slotKey] = {
              subject: entry.subject,
              subjectName: subject?.name || "Unknown",
              subjectCode: subject?.code || "Unknown",
              faculty: entry.faculty,
              facultyName: facultyEntry?.name || "Unknown",
              classroom: entry.classroom,
              classroomName: classroom?.name || "Unknown",
            };
          }
        });
        setTimetableData(timetable);
        setError(null);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || "Failed to fetch timetable";
        setError(errorMessage);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [viewType, selectedBatch, selectedBranch, selectedSemester, selectedSection, selectedFilter, timeSlots, subjects, faculty, classrooms]);

  // Filter functions for section view
  const getId = (item: string | { _id: string } | null): string | null => {
    if (!item) return null;
    return typeof item === "string" ? item : item._id;
  };

  const filteredSemesters = useMemo(() => {
    return semesters.filter((semester) => {
      const semesterBatchId = getId(semester.batch);
      const semesterBranchId = getId(semester.branch);
      return semesterBatchId === selectedBatch && semesterBranchId === selectedBranch;
    });
  }, [semesters, selectedBatch, selectedBranch]);

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const sectionSemesterId = getId(section.semester);
      return sectionSemesterId === selectedSemester;
    });
  }, [sections, selectedSemester]);

  const getSlotKey = (day: string, period: number) => `${day}-${period}`;

  const getPeriodTime = (day: string, period: number) => {
    const slot = timeSlots.find((ts) => ts.day === day && ts.period === period);
    return slot ? `${slot.startTime}-${slot.endTime}` : `Period ${period} (No time slot)`;
  };

  const exportToPDF = () => {
    if (viewType === "section" && (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection)) {
      toast({ title: "Error", description: "Please select all filters to export the timetable", variant: "destructive" });
      return;
    }
    if ((viewType === "faculty" || viewType === "classroom") && !selectedFilter) {
      toast({ title: "Error", description: "Please select a filter to export the timetable", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    const filterName =
      viewType === "section"
        ? sections.find((s) => s._id === selectedSection)?.name
        : viewType === "faculty"
          ? faculty.find((f) => f._id === selectedFilter)?.name
          : classrooms.find((c) => c._id === selectedFilter)?.name;
    doc.text(`Timetable for ${filterName} (${viewType})`, 14, 20);

    const tableData: string[][] = [];
    const headers = ["Day", ...periods.map((period) => `${getPeriodTime(days[0] || "Monday", period)}\nPeriod ${period}`)];

    days.forEach((day) => {
      const row: string[] = [day];
      periods.forEach((period) => {
        const slotKey = getSlotKey(day, period);
        const slotInfo = timetableData[slotKey];
        if (slotInfo) {
          row.push(`${slotInfo.subjectCode} - ${slotInfo.subjectName}\n${slotInfo.facultyName}\n${slotInfo.classroomName}`);
        } else {
          row.push("Free Period");
        }
      });
      tableData.push(row);
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    doc.save(`timetable-${viewType}-${filterName || (viewType === "section" ? selectedSection : selectedFilter)}.pdf`);
  };

  const printTimetable = () => {
    if (viewType === "section" && (!selectedBatch || !selectedBranch || !selectedSemester || !selectedSection)) {
      toast({ title: "Error", description: "Please select all filters to print the timetable", variant: "destructive" });
      return;
    }
    if ((viewType === "faculty" || viewType === "classroom") && !selectedFilter) {
      toast({ title: "Error", description: "Please select a filter to print the timetable", variant: "destructive" });
      return;
    }
    window.print();
  };

  const calculateSummaryStats = () => {
    const totalPeriods = days.length * periods.length;
    const scheduledPeriods = Object.keys(timetableData).length;
    const freePeriods = totalPeriods - scheduledPeriods;
    const utilization = totalPeriods > 0 ? Math.round((scheduledPeriods / totalPeriods) * 100) : 0;

    return { totalPeriods, scheduledPeriods, freePeriods, utilization };
  };

  const { totalPeriods, scheduledPeriods, freePeriods, utilization } = calculateSummaryStats();

  const renderTimetableGrid = () => {
    if (days.length === 0 || periods.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No valid time slots available for Monday to Saturday, periods 1 to 6.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-2 text-left text-sm font-medium text-gray-600 border-r border-gray-200">
                Day / Time
              </th>
              {periods.map((period) => (
                <th
                  key={period}
                  className={`px-2 py-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 ${period === currentPeriod && timeSlots.some((ts) => ts.day === currentDay && ts.period === period)
                      ? "bg-blue-50"
                      : ""
                    }`}
                >
                  <div className="flex flex-col">
                    <span>{getPeriodTime(days[0], period)}</span>
                    <span className="text-xs text-gray-500">Period {period}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-t border-gray-200">
                <td
                  className={`px-2 py-2 text-sm font-medium text-gray-600 border-r border-gray-200 whitespace-nowrap ${day === currentDay ? "bg-blue-50" : "bg-gray-50"
                    }`}
                >
                  {day}
                </td>
                {periods.map((period) => {
                  const slotKey = getSlotKey(day, period);
                  const slotInfo = timetableData[slotKey];
                  return (
                    <td
                      key={`${day}-${period}`}
                      className={`px-2 py-2 text-center text-sm border-r border-gray-200 ${day === currentDay && period === currentPeriod
                          ? "bg-blue-100"
                          : slotInfo
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-100"
                        } transition-colors duration-200 min-w-[150px]`}
                    >
                      {slotInfo ? (
                        <div className="text-left">
                          {/* <div className="font-semibold text-gray-800">{slotInfo.subjectCode}</div> */}

                          <Badge variant="default" className="text-xs">
                            {slotInfo.subjectCode}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{slotInfo.facultyName}</div>
                          <div className="text-xs text-gray-500">{slotInfo.classroomName}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Free</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {(loading || loadingFilterData) && (
        <div className="flex justify-center items-center fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-lg font-medium text-gray-900">Loading...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Timetables</h1>
        <p className="text-gray-600">View timetables by section, faculty, or classroom</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
              <CardDescription>Select view type and filter criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="view-type">View Type</Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">By Section</SelectItem>
                    <SelectItem value="faculty">By Faculty</SelectItem>
                    <SelectItem value="classroom">By Classroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewType === "section" ? (
                <>
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
                </>
              ) : (
                <div>
                  <Label htmlFor="filter">
                    {viewType === "faculty" && "Faculty"}
                    {viewType === "classroom" && "Classroom"}
                  </Label>
                  <Select
                    value={selectedFilter}
                    onValueChange={setSelectedFilter}
                    disabled={loadingFilterData}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingFilterData
                            ? "Loading..."
                            : `Select ${viewType}`
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingFilterData ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : viewType === "faculty" ? (
                        faculty.length > 0 ? (
                          faculty.map((member) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-faculty" disabled>
                            No faculty available
                          </SelectItem>
                        )
                      ) : classrooms.length > 0 ? (
                        classrooms.map((room) => (
                          <SelectItem key={room._id} value={room._id}>
                            {room.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classrooms" disabled>
                          No classrooms available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button onClick={exportToPDF} className="w-full" variant="outline" disabled={loading || loadingFilterData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={printTimetable} className="w-full" variant="outline" disabled={loading || loadingFilterData}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Timetable View</CardTitle>
              <CardDescription>
                {viewType === "section" ? (
                  selectedBatch && selectedBranch && selectedSemester && selectedSection ? (
                    `${branches.find((b) => b._id === selectedBranch)?.name || "Unknown"} - ${semesters.find((s) => s._id === selectedSemester)?.name || "Unknown"
                    } - Section ${sections.find((s) => s._id === selectedSection)?.name || "Unknown"} (${batches.find((b) => b._id === selectedBatch)?.name || "Unknown"
                    })`
                  ) : (
                    "Select criteria to view timetable"
                  )
                ) : selectedFilter ? (
                  `Showing timetable for ${viewType === "faculty"
                    ? faculty.find((f) => f._id === selectedFilter)?.name
                    : classrooms.find((c) => c._id === selectedFilter)?.name
                  } (${viewType})`
                ) : (
                  `Select a ${viewType} to view timetable`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(viewType === "section" && selectedBatch && selectedBranch && selectedSemester && selectedSection) ||
                (viewType !== "section" && selectedFilter) ? (
                <div className="space-y-6">
                  {renderTimetableGrid()}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={exportToPDF} variant="outline" size="sm" disabled={loading || loadingFilterData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={printTimetable} variant="outline" size="sm" disabled={loading || loadingFilterData}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {viewType === "section"
                    ? "Please select batch, branch, semester, and section to view the timetable"
                    : `Please select a ${viewType} to view the timetable`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {((viewType === "section" && selectedBatch && selectedBranch && selectedSemester && selectedSection) ||
        (viewType !== "section" && selectedFilter)) && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalPeriods}</div>
                    <div className="text-sm text-gray-600">Total Periods</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scheduledPeriods}</div>
                    <div className="text-sm text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{freePeriods}</div>
                    <div className="text-sm text-gray-600">Free Periods</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{utilization}%</div>
                    <div className="text-sm text-gray-600">Utilization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}