import TimeSlot from '../models/TimeSlot.js';
import { validateTimeFormat } from '../utils/timeUtils.js';

// Get all time slots
export const getTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find().sort({ day: 1, period: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Time slots fetched successfully',
      data: timeSlots,
    });
  } catch (error) {
    console.error('Get Time Slots Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Create a time slot
export const createTimeSlot = async (req, res) => {
  try {
    const { day, period, startTime, endTime } = req.body;

    // Validate time format
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return res.status(400).json({ success: false, message: 'Invalid time format. Use HH:MM (24-hour)' });
    }

    // Check if time slot already exists
    const existingSlot = await TimeSlot.findOne({ day, period });
    if (existingSlot) {
      return res.status(400).json({ success: false, message: `Time slot already exists for ${day}, Period ${period}` });
    }

    // Validate time range
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    if (endInMinutes <= startInMinutes) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const timeSlot = new TimeSlot({
      day,
      period,
      startTime,
      endTime,
    });

    await timeSlot.save();

    return res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      data: timeSlot,
    });
  } catch (error) {
    console.error('Create Time Slot Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete a time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if time slot is in use
    const isInUse = await TimetableEntry.findOne({ timeSlot: id });
    if (isInUse) {
      return res.status(400).json({ success: false, message: 'Cannot delete time slot in use by timetable' });
    }

    const timeSlot = await TimeSlot.findByIdAndDelete(id);
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Time slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete Time Slot Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};