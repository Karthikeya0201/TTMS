import type { TimetableEntry } from "@/lib/types"

export function checkConflicts(
  entries: TimetableEntry[],
  newEntry: Omit<TimetableEntry, "id" | "createdAt" | "updatedAt">,
): string[] {
  const conflicts: string[] = []

  const conflictingEntries = entries.filter((entry) => entry.day === newEntry.day && entry.period === newEntry.period)

  conflictingEntries.forEach((entry) => {
    if (entry.faculty === newEntry.faculty) {
      conflicts.push(`Faculty ${newEntry.faculty} is already assigned at this time`)
    }
    if (entry.classroom === newEntry.classroom) {
      conflicts.push(`Classroom ${newEntry.classroom} is already booked at this time`)
    }
  })

  return conflicts
}

export function generateTimetableKey(day: string, period: number): string {
  return `${day}-${period}`
}

export function parseTimetableKey(key: string): { day: string; period: number } {
  const [day, periodStr] = key.split("-")
  return { day, period: Number.parseInt(periodStr) }
}

export function calculateUtilization(entries: TimetableEntry[], totalSlots: number): number {
  const scheduledSlots = entries.length
  return Math.round((scheduledSlots / totalSlots) * 100)
}

export function groupEntriesBySection(entries: TimetableEntry[]): Record<string, TimetableEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      const sectionKey = `${entry.branch}-${entry.semester}-${entry.section}`
      if (!acc[sectionKey]) {
        acc[sectionKey] = []
      }
      acc[sectionKey].push(entry)
      return acc
    },
    {} as Record<string, TimetableEntry[]>,
  )
}

export function groupEntriesByFaculty(entries: TimetableEntry[]): Record<string, TimetableEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.faculty]) {
        acc[entry.faculty] = []
      }
      acc[entry.faculty].push(entry)
      return acc
    },
    {} as Record<string, TimetableEntry[]>,
  )
}

export function groupEntriesByClassroom(entries: TimetableEntry[]): Record<string, TimetableEntry[]> {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.classroom]) {
        acc[entry.classroom] = []
      }
      acc[entry.classroom].push(entry)
      return acc
    },
    {} as Record<string, TimetableEntry[]>,
  )
}
