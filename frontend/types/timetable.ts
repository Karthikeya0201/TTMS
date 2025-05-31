export interface Batch {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
}

export interface Branch {
  _id: string;
  name: string;
  branchCode: string;
}

export interface Semester {
  _id: string;
  name: string;
  branch: string | Branch;
  batch: string | Batch;
}

export interface Section {
  _id: string;
  name: string;
  semester: string | Semester;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  semester: string | { _id: string; name: string };
}

export interface Faculty {
  _id: string;
  name: string;
  email: string;
  subjects: string[] | Subject[];
}

export interface Classroom {
  _id: string;
  name: string;
  capacity: number;
}

export interface TimeSlot {
  _id: string;
  day: string;
  period: number;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:00"
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableEntry {
  _id: string;
  section: string;
  subject: string;
  faculty: string;
  classroom: string;
  timeSlot: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
}

export interface SlotData {
  subject: string;
  subjectName: string;
  subjectCode: string;
  faculty: string;
  facultyName: string;
  classroom: string;
  classroomName: string;
}