import TimeTableEntry from '../models/TimetableEntry.js';
import asyncHandler from 'express-async-handler';

// Get timetable by section
export const getTimetableBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const entries = await TimeTableEntry.find({ section: sectionId })
    .populate('subject faculty room timeSlot');
  res.json(entries);
});

// Check conflicts
export const checkConflicts = asyncHandler(async (req, res) => {
  const { timeSlot, faculty, room } = req.body;
  const conflicts = [];

  // Check faculty conflict
  const facultyConflict = await TimeTableEntry.findOne({
    faculty,
    timeSlot,
  });
  if (facultyConflict) {
    conflicts.push('Faculty is already assigned to another class at this time slot');
  }

  // Check room conflict
  const roomConflict = await TimeTableEntry.findOne({
    room,
    timeSlot,
  });
  if (roomConflict) {
    conflicts.push('Room is already booked at this time slot');
  }

  res.json({ conflicts });
});

// Create timetable entries
export const createTimetable = asyncHandler(async (req, res) => {
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400);
    throw new Error('Invalid timetable entries');
  }

  // Delete existing entries for the section
  await TimeTableEntry.deleteMany({ section: entries[0].section });

  // Create new entries
  const createdEntries = await TimeTableEntry.insertMany(entries);
  res.status(201).json(createdEntries);
});