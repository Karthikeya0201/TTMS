import asyncHandler from 'express-async-handler';
import TimeSlot from '../models/TimeSlot.js';
import TimetableEntry from '../models/TimetableEntry.js';
import { validateTimeFormat } from '../utils/timeUtils.js';

// Get all time slots
export const getTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await TimeSlot.find().sort({ day: 1, period: 1 }).lean();
  res.status(200).json({
    success: true,
    data: timeSlots,
    message: timeSlots.length > 0 ? 'Time slots retrieved successfully' : 'No time slots found',
  });
});

// Create a time slot
export const createTimeSlot = asyncHandler(async (req, res) => {
  const { day, period, startTime, endTime } = req.body;
  if (!day || !period || !startTime || !endTime) {
    res.status(400).json({
      success: false,
      message: 'All fields (day, period, startTime, endTime) are required',
    });
    return;
  }
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    res.status(400).json({
      success: false,
      message: 'Invalid time format. Use HH:mm (24-hour)',
    });
    return;
  }
  const existingSlot = await TimeSlot.findOne({ day, period });
  if (existingSlot) {
    res.status(400).json({
      success: false,
      message: `Time slot already exists for ${day}, Period ${period}`,
    });
    return;
  }
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  if (endInMinutes <= startInMinutes) {
    res.status(400).json({
      success: false,
      message: 'End time must be after start time',
    });
    return;
  }
  const timeSlot = await TimeSlot.create({ day, period, startTime, endTime });
  res.status(201).json({
    success: true,
    data: timeSlot,
    message: 'Time slot created successfully',
  });
});

// Delete a time slot
export const deleteTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isInUse = await TimetableEntry.findOne({ timeSlot: id });
  if (isInUse) {
    res.status(400).json({
      success: false,
      message: 'Cannot delete time slot in use by timetable',
    });
    return;
  }
  const timeSlot = await TimeSlot.findByIdAndDelete(id);
  if (!timeSlot) {
    res.status(404).json({
      success: false,
      message: 'Time slot not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Time slot deleted successfully',
  });
});