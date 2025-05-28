export interface Batch {
  id: string
  name: string
  startYear: number
  endYear: number
}

export interface Branch {
  id: string
  name: string
  code: string
}

export interface Subject {
  id: string
  name: string
  code: string
  semester: string
  branch: string
  credits: number
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: string
  subjects: string[]
}

export interface Classroom {
  id: string
  name: string
  capacity: number
  type: string
  building?: string
}

export interface TimetableEntry {
  id: string
  batch: string
  branch: string
  semester: string
  section: string
  day: string
  period: number
  subject: string
  faculty: string
  classroom: string
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlot {
  id: number
  time: string
  period: number
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: 1, time: "9:00 - 10:00", period: 1 },
  { id: 2, time: "10:00 - 11:00", period: 2 },
  { id: 3, time: "11:15 - 12:15", period: 3 },
  { id: 4, time: "12:15 - 1:15", period: 4 },
  { id: 5, time: "2:15 - 3:15", period: 5 },
  { id: 6, time: "3:15 - 4:15", period: 6 },
]

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const SEMESTERS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"]

export const SECTIONS = ["A", "B", "C"]
