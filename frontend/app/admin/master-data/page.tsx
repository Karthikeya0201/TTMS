"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import ReactSelect from "react-select";
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
  branch: Branch; // Populated Branch object
  batch: Batch;   // Populated Batch object
}

interface Section {
  _id: string;
  name: string;
  semester: Semester; // Populated Semester object (not just a string)
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  semester: string; // Semester _id
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  subjects: string[]; // Array of Subject _ids
}

interface Classroom {
  _id: string;
  name: string;
  capacity: number;
}

interface Option {
  value: string;
  label: string;
}

export default function MasterDataPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState({
    initial: true,
    batch: false,
    branch: false,
    semester: false,
    section: false,
    subject: false,
    faculty: false,
    classroom: false,
  });
  const [error, setError] = useState<string | null>(null);

  const [newBatch, setNewBatch] = useState<{ name: string; startYear: string; endYear: string }>({
    name: "",
    startYear: "",
    endYear: "",
  });
  const [newBranch, setNewBranch] = useState<{ name: string; branchCode: string }>({
    name: "",
    branchCode: "",
  });
  const [newSemester, setNewSemester] = useState<{ name: string; branch: string; batch: string }>({
    name: "",
    branch: "",
    batch: "",
  });
  const [newSection, setNewSection] = useState<{ name: string; semester: string }>({
    name: "",
    semester: "",
  });
  const [newSubject, setNewSubject] = useState<{ name: string; code: string; semester: string }>({
    name: "",
    code: "",
    semester: "",
  });
  const [newFaculty, setNewFaculty] = useState<{ name: string; email: string; subjects: string[] }>({
    name: "",
    email: "",
    subjects: [],
  });
  const [newClassroom, setNewClassroom] = useState<{ name: string; capacity: string }>({
    name: "",
    capacity: "",
  });

  // Base URL for API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Get JWT token from local storage
  const getToken = () => localStorage.getItem("token") || "";

  // Configure Axios instance with default headers
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add JWT token to requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        const [batchesRes, branchesRes, semestersRes, sectionsRes, subjectsRes, facultyRes, classroomsRes] =
          await Promise.all([
            axiosInstance.get("/batches"),
            axiosInstance.get("/branches"),
            axiosInstance.get("/semesters"),
            axiosInstance.get("/sections"),
            axiosInstance.get("/subjects"),
            axiosInstance.get("/faculties"),
            axiosInstance.get("/classrooms"),
          ]);

        setBatches(batchesRes.data.data || batchesRes.data);
        setBranches(branchesRes.data.data || branchesRes.data);
        setSemesters(semestersRes.data.data || semestersRes.data);
        setSections(sectionsRes.data.data || sectionsRes.data);
        setSubjects(subjectsRes.data.data || subjectsRes.data);
        setFaculty(facultyRes.data.data || facultyRes.data);
        setClassrooms(classroomsRes.data.data || classroomsRes.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || "Failed to fetch data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        if (error.response?.status === 401) {
          window.location.href = "/login";
        }
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };

    fetchData();
  }, []);

  // Generic delete handler
  const handleDelete = useCallback(
    async (entity: string, id: string, setState: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
        await axiosInstance.delete(`/${entity}/${id}`);
        setState((prev) => prev.filter((item) => item._id !== id));
        toast({ title: "Success", description: `${entity.slice(0, -1)} deleted successfully` });
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        toast({
          title: "Error",
          description: error.response?.data?.message || `Failed to delete ${entity.slice(0, -1)}`,
          variant: "destructive",
        });
      }
    },
    []
  );

  // Batch CRUD
  const addBatch = async () => {
    if (!newBatch.name || !newBatch.startYear || !newBatch.endYear) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    const startYear = Number(newBatch.startYear);
    const endYear = Number(newBatch.endYear);
    if (startYear < 2000 || endYear < startYear) {
      toast({ title: "Error", description: "Invalid year range", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, batch: true }));
    try {
      const response = await axiosInstance.post("/batches", {
        name: newBatch.name,
        startYear,
        endYear,
      });
      setBatches([...batches, response.data.data || response.data]);
      setNewBatch({ name: "", startYear: "", endYear: "" });
      toast({ title: "Success", description: "Batch added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add batch",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, batch: false }));
    }
  };

  // Branch CRUD
  const addBranch = async () => {
    if (!newBranch.name || !newBranch.branchCode) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (!/^[A-Z]{2,5}$/.test(newBranch.branchCode)) {
      toast({ title: "Error", description: "Branch code must be 2-5 uppercase letters", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, branch: true }));
    try {
      const response = await axiosInstance.post("/branches", newBranch);
      setBranches([...branches, response.data.data || response.data]);
      setNewBranch({ name: "", branchCode: "" });
      toast({ title: "Success", description: "Branch added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add branch",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, branch: false }));
    }
  };

  // Semester CRUD
  const addSemester = async () => {
    if (!newSemester.name || !newSemester.branch || !newSemester.batch) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (!/^[1-4]-[1-2]$/.test(newSemester.name)) {
      toast({ title: "Error", description: "Semester name must be in format X-Y (e.g., 1-1)", variant: "destructive" });
      return;
    }
    const selectedBranch = branches.find((b) => b._id === newSemester.branch);
    const selectedBatch = batches.find((b) => b._id === newSemester.batch);
    if (!selectedBranch || !selectedBatch) {
      toast({ title: "Error", description: "Invalid branch or batch selected", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, semester: true }));
    try {
      const response = await axiosInstance.post("/semesters", {
        name: newSemester.name,
        branch: newSemester.branch,
        batch: newSemester.batch,
      });
      const newSemesterData = response.data.data || response.data;
      setSemesters([...semesters, newSemesterData]);
      setNewSemester({ name: "", branch: "", batch: "" });
      toast({ title: "Success", description: "Semester added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add semester",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, semester: false }));
    }
  };

  // Section CRUD
  const addSection = async () => {
    if (!newSection.name || !newSection.semester) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (!/^[A-Z](-[A-Z])?$/.test(newSection.name)) {
      toast({ title: "Error", description: "Section name must be a single uppercase letter or two uppercase letters separated by a hyphen (e.g., A or A-B)", variant: "destructive" });
      return;
    }
    const selectedSemester = semesters.find((s) => s._id === newSection.semester);
    if (!selectedSemester) {
      toast({ title: "Error", description: "Invalid semester selected", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, section: true }));
    try {
      const response = await axiosInstance.post("/sections", {
        name: newSection.name,
        semester: newSection.semester,
      });
      setSections([...sections, response.data]);
      setNewSection({ name: "", semester: "" });
      toast({ title: "Success", description: "Section added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add section",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, section: false }));
    }
  };

  // Subject CRUD
  const addSubject = async () => {
    if (!newSubject.name || !newSubject.code || !newSubject.semester) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, subject: true }));
    try {
      const response = await axiosInstance.post("/subjects", newSubject);
      setSubjects([...subjects, response.data.data || response.data]);
      setNewSubject({ name: "", code: "", semester: "" });
      toast({ title: "Success", description: "Subject added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add subject",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, subject: false }));
    }
  };

  // Faculty CRUD
  const addFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newFaculty.email)) {
      toast({ title: "Error", description: "Invalid email format", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, faculty: true }));
    try {
      const response = await axiosInstance.post("/faculties", newFaculty);
      setFaculty([...faculty, response.data.data || response.data]);
      setNewFaculty({ name: "", email: "", subjects: [] });
      toast({ title: "Success", description: "Faculty added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add faculty",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, faculty: false }));
    }
  };

  // Classroom CRUD
  const addClassroom = async () => {
    if (!newClassroom.name || !newClassroom.capacity) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    const capacity = Number(newClassroom.capacity);
    if (capacity < 1) {
      toast({ title: "Error", description: "Capacity must be at least 1", variant: "destructive" });
      return;
    }
    setLoading((prev) => ({ ...prev, classroom: true }));
    try {
      const response = await axiosInstance.post("/classrooms", {
        name: newClassroom.name,
        capacity,
      });
      setClassrooms([...classrooms, response.data.data || response.data]);
      setNewClassroom({ name: "", capacity: "" });
      toast({ title: "Success", description: "Classroom added successfully" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add classroom",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, classroom: false }));
    }
  };

  if (loading.initial) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-lg font-medium text-gray-600">Loading master data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Data</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Data Management</h1>
        <p className="text-gray-600">Manage all master data for the timetable system</p>
      </div>

      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>Manage academic batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input
                    id="batch-name"
                    placeholder="e.g., 2024-2028"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-start-year">Start Year</Label>
                  <Input
                    id="batch-start-year"
                    type="number"
                    placeholder="e.g., 2024"
                    value={newBatch.startYear}
                    onChange={(e) => setNewBatch({ ...newBatch, startYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-end-year">End Year</Label>
                  <Input
                    id="batch-end-year"
                    type="number"
                    placeholder="e.g., 2028"
                    value={newBatch.endYear}
                    onChange={(e) => setNewBatch({ ...newBatch, endYear: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addBatch} disabled={loading.batch} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.batch ? "Adding..." : "Add Batch"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {batches.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No batches available</div>
                ) : (
                  batches.map((batch) => (
                    <div key={batch._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{batch.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {batch.startYear}-{batch.endYear}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("batches", batch._id, setBatches)}
                        disabled={loading.batch}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>Branch Management</CardTitle>
              <CardDescription>Manage engineering branches and departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="branch-name">Branch Name</Label>
                  <Input
                    id="branch-name"
                    placeholder="e.g., Computer Science Engineering"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="branch-code">Branch Code</Label>
                  <Input
                    id="branch-code"
                    placeholder="e.g., CSE"
                    value={newBranch.branchCode}
                    onChange={(e) => setNewBranch({ ...newBranch, branchCode: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addBranch} disabled={loading.branch} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.branch ? "Adding..." : "Add Branch"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {branches.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No branches available</div>
                ) : (
                  branches.map((branch) => (
                    <div key={branch._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{branch.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {branch.branchCode}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("branches", branch._id, setBranches)}
                        disabled={loading.branch}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semesters">
          <Card>
            <CardHeader>
              <CardTitle>Semester Management</CardTitle>
              <CardDescription>Manage semesters for batches and branches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="semester-name">Semester Name</Label>
                  <Input
                    id="semester-name"
                    placeholder="e.g., 1-1"
                    value={newSemester.name}
                    onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="semester-branch">Branch</Label>
                  <Select
                    value={newSemester.branch}
                    onValueChange={(value) => setNewSemester({ ...newSemester, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={branches.length === 0 ? "No branches available" : "Select branch"} />
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
                  <Label htmlFor="semester-batch">Batch</Label>
                  <Select
                    value={newSemester.batch}
                    onValueChange={(value) => setNewSemester({ ...newSemester, batch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={batches.length === 0 ? "No batches available" : "Select batch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.length === 0 ? (
                        <SelectItem value="no-batches" disabled>
                          No batches available
                        </SelectItem>
                      ) : (
                        batches.map((batch) => (
                          <SelectItem key={batch._id} value={batch._id}>
                            {batch.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addSemester}
                    disabled={loading.semester || branches.length === 0 || batches.length === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.semester ? "Adding..." : "Add Semester"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {semesters.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No semesters available</div>
                ) : (
                  semesters.map((semester) => {
                    const branch = branches.find((b) => b._id === semester.branch._id);
                    const batch = batches.find((b) => b._id === semester.batch._id);
                    return (
                      <div key={semester._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{semester.name}</span>
                          <Badge variant="outline" className="ml-2">
                            Branch: {branch ? `${branch.name} (${branch.branchCode})` : "Unknown"}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            Batch: {batch ? batch.name : "Unknown"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete("semesters", semester._id, setSemesters)}
                          disabled={loading.semester}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Section Management</CardTitle>
              <CardDescription>Manage sections for each semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="section-name">Section Name</Label>
                  <Input
                    id="section-name"
                    placeholder="e.g., A or A-B"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="section-semester">Semester</Label>
                  <Select
                    value={newSection.semester}
                    onValueChange={(value) => setNewSection({ ...newSection, semester: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={semesters.length === 0 ? "No semesters available" : "Select semester"} />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.length === 0 ? (
                        <SelectItem value="no-semesters" disabled>
                          No semesters available
                        </SelectItem>
                      ) : (
                        semesters.map((semester) => {
                          const branch = branches.find((b) => b._id === semester.branch._id);
                          return (
                            <SelectItem key={semester._id} value={semester._id}>
                              {semester.name} ({branch ? branch.branchCode : "Unknown"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addSection}
                    disabled={loading.section || semesters.length === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.section ? "Adding..." : "Add Section"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {sections.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No sections available</div>
                ) : (
                  sections.map((section) => (
                    <div key={section._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{section.name}</span>
                        <Badge variant="outline" className="ml-2">
                          Semester: {section.semester?.name ?? "Unknown"}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          Branch: {section.semester?.branch?.branchCode ?? "Unknown"}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          Batch: {section.semester?.batch?.name ?? "Unknown"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("sections", section._id, setSections)}
                        disabled={loading.section}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subject Management</CardTitle>
              <CardDescription>Manage subjects and their semester mappings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Data Structures"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject-code">Subject Code</Label>
                  <Input
                    id="subject-code"
                    placeholder="e.g., CS201"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject-semester">Semester</Label>
                  <Select
                    value={newSubject.semester}
                    onValueChange={(value) => setNewSubject({ ...newSubject, semester: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={semesters.length === 0 ? "No semesters available" : "Select semester"} />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.length === 0 ? (
                        <SelectItem value="no-semesters" disabled>
                          No semesters available
                        </SelectItem>
                      ) : (
                        semesters.map((semester) => {
                          const branch = branches.find((b) => b._id === semester.branch._id);
                          return (
                            <SelectItem key={semester._id} value={semester._id}>
                              {semester.name} ({branch ? branch.branchCode : "Unknown"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addSubject}
                    disabled={loading.subject || semesters.length === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.subject ? "Adding..." : "Add Subject"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No subjects available</div>
                ) : (
                  subjects.map((subject) => {
                    const semester = semesters.find((s) => s._id === subject.semester);
                    const branch = semester ? branches.find((b) => b._id === semester.branch._id) : null;
                    return (
                      <div key={subject._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{subject.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {subject.code}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            Semester: {semester ? semester.name : "Unknown"}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            Branch: {branch ? branch.branchCode : "Unknown"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete("subjects", subject._id, setSubjects)}
                          disabled={loading.subject}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Management</CardTitle>
              <CardDescription>Manage faculty members and their subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="faculty-name">Faculty Name</Label>
                  <Input
                    id="faculty-name"
                    placeholder="e.g., Dr. John Smith"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="faculty-email">Email</Label>
                  <Input
                    id="faculty-email"
                    type="email"
                    placeholder="e.g., john@college.edu"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="faculty-subjects">Subjects</Label>
                  <ReactSelect
                    isMulti
                    options={subjects.map((subject) => ({
                      value: subject._id,
                      label: `${subject.name} (${subject.code})`,
                    }))}
                    value={newFaculty.subjects.map((id) => {
                      const subject = subjects.find((s) => s._id === id);
                      return { value: id, label: subject ? `${subject.name} (${subject.code})` : id };
                    })}
                    onChange={(selected) =>
                      setNewFaculty({
                        ...newFaculty,
                        subjects: selected ? selected.map((s: Option) => s.value) : [],
                      })
                    }
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder={subjects.length === 0 ? "No subjects available" : "Select subjects"}
                    isDisabled={subjects.length === 0}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addFaculty} disabled={loading.faculty} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.faculty ? "Adding..." : "Add Faculty"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {faculty.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No faculty available</div>
                ) : (
                  faculty.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{member.email}</span>
                        {member.subjects.map((subjectId) => {
                          const subject = subjects.find((s) => s._id === subjectId);
                          return (
                            <Badge key={subjectId} variant="secondary" className="ml-1">
                              {subject ? subject.code : "Unknown"}
                            </Badge>
                          );
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("faculties", member._id, setFaculty)}
                        disabled={loading.faculty}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classrooms">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Management</CardTitle>
              <CardDescription>Manage classrooms and their capacities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="classroom-name">Classroom Name</Label>
                  <Input
                    id="classroom-name"
                    placeholder="e.g., Room 101"
                    value={newClassroom.name}
                    onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 60"
                    value={newClassroom.capacity}
                    onChange={(e) => setNewClassroom({ ...newClassroom, capacity: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addClassroom} disabled={loading.classroom} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading.classroom ? "Adding..." : "Add Classroom"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {classrooms.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No classrooms available</div>
                ) : (
                  classrooms.map((classroom) => (
                    <div key={classroom._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{classroom.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          Capacity: {classroom.capacity}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("classrooms", classroom._id, setClassrooms)}
                        disabled={loading.classroom}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}