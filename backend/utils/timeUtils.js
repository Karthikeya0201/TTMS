// utils/timeUtils.js

/**
 * Validates a time string to ensure it’s in HH:mm (24-hour) format.
 * @param {string} time - Time string (e.g., "09:00").
 * @returns {boolean} True if valid, false otherwise.
 */
export const validateTimeFormat = (time) => {
  if (!time || typeof time !== "string") {
    return false;
  }

  // Regex for HH:mm (24-hour format, 00:00 to 23:59)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Converts a time string (HH:mm) to minutes since midnight for comparison.
 * @param {string} time - Time string in HH:mm format.
 * @returns {number|null} Minutes since midnight, or null if invalid.
 */
export const timeToMinutes = (time) => {
  if (!validateTimeFormat(time)) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Validates a time slot object against expected structure and constraints.
 * @param {Object} timeSlot - Time slot object with day, period, startTime, endTime.
 * @returns {Object} { isValid: boolean, error: string|null } - Validation result.
 */
export const validateTimeSlot = (timeSlot) => {
  if (!timeSlot || typeof timeSlot !== "object") {
    return { isValid: false, error: "Invalid time slot object" };
  }

  const { day, period, startTime, endTime } = timeSlot;
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Check required fields
  if (!day || !period || !startTime || !endTime) {
    return { isValid: false, error: "Missing required fields: day, period, startTime, endTime" };
  }

  // Validate day
  if (!daysOfWeek.includes(day)) {
    return { isValid: false, error: `Invalid day. Must be one of: ${daysOfWeek.join(", ")}` };
  }

  // Validate period
  if (!Number.isInteger(period) || period <= 0) {
    return { isValid: false, error: "Period must be a positive integer" };
  }

  // Validate time formats
  if (!validateTimeFormat(startTime)) {
    return { isValid: false, error: "Invalid startTime format. Use HH:mm (24-hour)" };
  }
  if (!validateTimeFormat(endTime)) {
    return { isValid: false, error: "Invalid endTime format. Use HH:mm (24-hour)" };
  }

  // Validate time range (endTime must be after startTime)
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return { isValid: false, error: "End time must be after start time" };
  }

  return { isValid: true, error: null };
};

/**
 * Formats a time string to ensure consistent HH:mm output.
 * @param {string} time - Time string (e.g., "9:0" or "09:00").
 * @returns {string} Formatted time string (HH:mm) or empty string if invalid.
 */
export const formatTime = (time) => {
  if (!validateTimeFormat(time)) {
    return "";
  }
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Checks if two time slots overlap.
 * @param {Object} slot1 - First time slot { day, startTime, endTime }.
 * @param {Object} slot2 - Second time slot { day, startTime, endTime }.
 * @returns {boolean} True if slots overlap on the same day, false otherwise.
 */
export const doTimeSlotsOverlap = (slot1, slot2) => {
  if (!slot1 || !slot2 || slot1.day !== slot2.day) {
    return false;
  }

  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  if (start1 === null || end1 === null || start2 === null || end2 === null) {
    return false;
  }

  // Slots overlap if one starts before the other ends
  return start1 < end2 && start2 < end1;
};

export default {
  validateTimeFormat,
  timeToMinutes,
  validateTimeSlot,
  formatTime,
  doTimeSlotsOverlap,
};