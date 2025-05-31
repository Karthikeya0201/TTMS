export interface TimeSlot {
  _id: string;
  day: string;
  period: number;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:00"
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Validates if a day string is a valid weekday.
 * @param day - The day to validate (e.g., "Monday").
 * @returns True if valid, false otherwise.
 */
const isValidDay = (day: string): boolean => {
  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return validDays.includes(day.toLowerCase());
};

/**
 * Validates if a period is a positive integer.
 * @param period - The period number to validate.
 * @returns True if valid, false otherwise.
 */
const isValidPeriod = (period: number): boolean => {
  return Number.isInteger(period) && period > 0;
};

/**
 * Converts a Date object to Indian Standard Time (IST).
 * @param date - The Date object to convert.
 * @returns A new Date object adjusted to IST (+05:30).
 */
export const toIST = (date: Date): Date => {
  try {
    const offsetIST = 5.5 * 60 * 60 * 1000; // IST is UTC+05:30 in milliseconds
    const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
    return new Date(utc + offsetIST);
  } catch (error: unknown) {
    console.error("Error converting to IST:", error instanceof Error ? error.message : String(error));
    return date; // Fallback to input date
  }
};

/**
 * Determines the current period based on time slots, day, and time.
 * @param timeSlots - Array of TimeSlot objects or null.
 * @param currentDay - The current day (e.g., "Monday").
 * @param currentTime - The current Date object (defaults to now in IST).
 * @returns The current period number or null if none found.
 */
export const getCurrentPeriod = (
  timeSlots: TimeSlot[] | null,
  currentDay: string,
  currentTime: Date = toIST(new Date())
): number | null => {
  if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    console.warn("getCurrentPeriod: Invalid or empty timeSlots", { timeSlots });
    return null;
  }

  if (!isValidDay(currentDay)) {
    console.warn("getCurrentPeriod: Invalid day provided", { currentDay });
    return null;
  }

  const todaySlots = timeSlots.filter((slot) => slot.day.toLowerCase() === currentDay.toLowerCase());
  if (todaySlots.length === 0) {
    return null;
  }

  try {
    const currentPeriod = todaySlots.find((slot) => {
      const slotDate = currentTime.toISOString().split("T")[0];
      const start = new Date(`${slotDate}T${slot.startTime}:00+05:30`);
      const end = new Date(`${slotDate}T${slot.endTime}:00+05:30`);
      return currentTime >= start && currentTime < end; // Use < end to exclude end boundary
    });
    return currentPeriod ? currentPeriod.period : null;
  } catch (error: unknown) {
    console.error(
      "Error determining current period:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

/**
 * Gets the time range for a given day and period.
 * @param day - The day (e.g., "Monday").
 * @param period - The period number (e.g., 1).
 * @param timeSlots - Array of TimeSlot objects or null.
 * @returns Formatted time range (e.g., "09:00-10:00") or fallback string.
 */
export const getPeriodTime = (day: string, period: number, timeSlots: TimeSlot[] | null): string => {
  if (!isValidDay(day)) {
    console.warn("getPeriodTime: Invalid day provided", { day });
    return `Period ${period} (Invalid day)`;
  }

  if (!isValidPeriod(period)) {
    console.warn("getPeriodTime: Invalid period provided", { period });
    return `Period ${period} (Invalid period)`;
  }

  if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    console.warn("getPeriodTime: Invalid or empty timeSlots", { timeSlots });
    return `Period ${period} (No time slot)`;
  }

  const slot = timeSlots.find(
    (ts) => ts.day.toLowerCase() === day.toLowerCase() && ts.period === period
  );
  return slot ? `${slot.startTime}-${slot.endTime}` : `Period ${period} (No time slot)`;
};

/**
 * Checks if a time slot exists for a given day and period.
 * @param day - The day (e.g., "Monday").
 * @param period - The period number (e.g., 1).
 * @param timeSlots - Array of TimeSlot objects or null.
 * @returns True if a time slot exists, false otherwise.
 */
export const hasTimeSlot = (day: string, period: number, timeSlots: TimeSlot[] | null): boolean => {
  if (!isValidDay(day)) {
    console.warn("hasTimeSlot: Invalid day provided", { day });
    return false;
  }

  if (!isValidPeriod(period)) {
    console.warn("hasTimeSlot: Invalid period provided", { period });
    return false;
  }

  if (!timeSlots || !Array.isArray(timeSlots)) {
    console.warn("hasTimeSlot: Invalid or missing timeSlots", { timeSlots });
    return false;
  }

  return timeSlots.some(
    (ts) => ts.day.toLowerCase() === day.toLowerCase() && ts.period === period
  );
};
