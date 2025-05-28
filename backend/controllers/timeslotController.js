import TimeSlot from '../models/TimeSlot.js';
import asyncHandler from 'express-async-handler';

// Get all time slots
export const getTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = await TimeSlot.find();
  res.json(timeSlots);
});

// Create a time slot
export const createTimeSlot = asyncHandler(async (req, res) => {
  const { day, period, startTime, endTime } = req.body;
  if (!day || !period || !startTime || !endTime) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const timeSlot = await TimeSlot.create({ day, period, startTime, endTime });
  res.status(201).json(timeSlot);
});

// Delete a time slot
export const deleteTimeSlot = asyncHandler(async (req, res) => {
  const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
  if (!timeSlot) {
    res.status(404);
    throw new Error('Time slot not found');
  }
  res.json({ message: 'Time slot deleted' });
});