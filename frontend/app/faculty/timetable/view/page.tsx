"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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
}

type TimetableData = { [slotKey: string]: SlotData };

interface APIResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export default function ViewTimetablePage() {
  const [viewType, setViewType] = useState<string>("section");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFilterData, setLoadingFilterData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null);

  const router = useRouter();
  const API_BASE_URL = "https://ttms.onrender.com/api";
  const currentDay = "Wednesday"; // Since today is Wednesday, May 28, 2025
  const currentTime = new Date("2025-05-28T22:17:00+05:30"); // 10:17 PM IST

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
        const [sectionsRes, facultyRes, classroomsRes, timeSlotsRes] = await Promise.all([
          axiosInstance.get("/sections"),
          axiosInstance.get("/faculties"),
          axiosInstance.get("/classrooms"),
          axiosInstance.get("/timeslots"),
        ]);

        const fetchedSections = sectionsRes.data?.data || sectionsRes.data || [];
        const fetchedFaculty = facultyRes.data?.data || facultyRes.data || [];
        const fetchedClassrooms = classroomsRes.data?.data || classroomsRes.data || [];
        const fetchedTimeSlots = timeSlotsRes.data?.data || timeSlotsRes.data || [];

        setSections(fetchedSections);
        setFaculty(fetchedFaculty);
        setClassrooms(fetchedClassrooms);
        setTimeSlots(
          fetchedTimeSlots.sort((a: TimeSlot, b: TimeSlot) => {
            if (a.day === b.day) return a.period - b.period;
            return days.indexOf(a.day) - days.indexOf(b.day);
          })
        );

        if (!fetchedSections.length || !fetchedFaculty.length || !fetchedClassrooms.length) {
          toast({
            title: "Warning",
            description: "Some master data (sections, faculty, or classrooms) is missing. Please ensure the backend database is populated.",
            variant: "destructive",
          });
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch master data";
        setError(errorMessage);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setLoadingFilterData(false);
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
  }, [timeSlots]);

  // Reset selectedFilter when viewType changes
  useEffect(() => {
    setSelectedFilter("");
    setTimetableData({});
  }, [viewType]);

  // Fetch timetable data based on viewType and selectedFilter
  useEffect(() => {
    if (!selectedFilter || !viewType) {
      setTimetableData({});
      return;
    }

    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const endpoint =
          viewType === "section"
            ? `/timetable/section/${selectedFilter}`
            : viewType === "faculty"
            ? `/timetable/faculty/${selectedFilter}`
            : `/timetable/classroom/${selectedFilter}`;
        const res = await axiosInstance.get<APIResponse<TimetableEntry[]>>(endpoint);
        const entries: TimetableEntry[] = res.data?.data || res.data || [];

        const timetable: TimetableData = {};
        entries.forEach((entry) => {
          const timeSlot = typeof entry.timeSlot === "string" ? timeSlots.find((ts) => ts._id === entry.timeSlot) : entry.timeSlot;
          if (timeSlot) {
            const slotKey = `${timeSlot.day}-${timeSlot.period}`;
            timetable[slotKey] = {
              subject: entry.subject,
              faculty: entry.faculty,
              classroom: entry.classroom,
            };
          }
        });
        setTimetableData(timetable);
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
  }, [viewType, selectedFilter, timeSlots]);

  // Dynamically determine days and periods from timeSlots
  const days = timeSlots.length > 0
    ? Array.from(new Set(timeSlots.map((slot) => slot.day))).sort(
        (a, b) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(a) -
                  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(b)
      )
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const periods = timeSlots.length > 0
    ? Array.from(new Set(timeSlots.map((slot) => slot.period))).sort((a, b) => a - b)
    : [1, 2, 3, 4, 5, 6];

  const getSlotKey = (day: string, period: number) => `${day}-${period}`;

  const getPeriodTime = (day: string, period: number) => {
    const slot = timeSlots.find((ts) => ts.day === day && ts.period === period);
    return slot ? `${slot.startTime}-${slot.endTime}` : `Period ${period} (No time slot)`;
  };

  const exportToPDF = () => {
    if (!selectedFilter) {
      toast({ title: "Error", description: "Please select a filter to export the timetable", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    const filterName =
      viewType === "section"
        ? sections.find((s) => s._id === selectedFilter)?.name
        : viewType === "faculty"
        ? faculty.find((f) => f._id === selectedFilter)?.name
        : classrooms.find((c) => c._id === selectedFilter)?.name;
    doc.text(`Timetable for ${filterName} (${viewType})`, 14, 20);

    const tableData: string[][] = [];
    const headers = ["Time", ...days];

    periods.forEach((period) => {
      const row: string[] = [`${getPeriodTime(days[0], period)}\nPeriod ${period}`];
      days.forEach((day) => {
        const slotKey = getSlotKey(day, period);
        const slotInfo = timetableData[slotKey];
        if (slotInfo) {
          const subject = typeof slotInfo.subject === "string"
            ? { name: "Unknown", code: slotInfo.subject }
            : slotInfo.subject;
          const faculty = typeof slotInfo.faculty === "string"
            ? slotInfo.faculty
            : slotInfo.faculty.name;
          const classroom = typeof slotInfo.classroom === "string"
            ? slotInfo.classroom
            : slotInfo.classroom.name;
          row.push(`${subject.code} - ${subject.name}\n${faculty}\n${classroom}`);
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

    doc.save(`timetable-${viewType}-${filterName || selectedFilter}.pdf`);
  };

  const printTimetable = () => {
    if (!selectedFilter) {
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

  const renderTimetableGrid = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Time</th>
            {days.map((day) => (
              <th
                key={day}
                className={`border border-gray-300 p-3 bg-gray-50 font-semibold min-w-[180px] ${
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
                className={`border border-gray-300 p-3 font-medium bg-gray-50 ${
                  period === currentPeriod && timeSlots.some((ts) => ts.day === currentDay && ts.period === period)
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                <div className="text-sm font-semibold">{getPeriodTime(days[0], period)}</div>
                <div className="text-xs text-gray-500">Period {period}</div>
              </td>
              {days.map((day) => {
                const slotKey = getSlotKey(day, period);
                const slotInfo = timetableData[slotKey];
                return (
                  <td
                    key={`${day}-${period}`}
                    className={`border border-gray-300 p-3 ${
                      day === currentDay && period === currentPeriod ? "bg-blue-200" : ""
                    }`}
                  >
                    {slotInfo ? (
                      <div className="space-y-2">
                        <Badge variant="default" className="text-xs font-medium">
                          {typeof slotInfo.subject === "string" ? slotInfo.subject : slotInfo.subject.code}
                        </Badge>
                        <div className="text-sm font-medium text-gray-800">
                          {typeof slotInfo.subject === "string" ? "Unknown" : slotInfo.subject.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {typeof slotInfo.faculty === "string" ? slotInfo.faculty : slotInfo.faculty.name}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {typeof slotInfo.classroom === "string" ? slotInfo.classroom : slotInfo.classroom.name}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-4">Free Period</div>
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

              <div>
                <Label htmlFor="filter">
                  {viewType === "section" && "Section"}
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
                    ) : viewType === "section" ? (
                      sections.length > 0 ? (
                        sections.map((section) => (
                          <SelectItem key={section._id} value={section._id}>
                            {section.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-sections" disabled>
                          No sections available
                        </SelectItem>
                      )
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
                {selectedFilter
                  ? `Showing timetable for ${
                      viewType === "section"
                        ? sections.find((s) => s._id === selectedFilter)?.name
                        : viewType === "faculty"
                        ? faculty.find((f) => f._id === selectedFilter)?.name
                        : classrooms.find((c) => c._id === selectedFilter)?.name
                    } (${viewType})`
                  : `Select a ${viewType} to view timetable`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFilter ? (
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
                  Please select a {viewType} to view the timetable
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedFilter && (
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