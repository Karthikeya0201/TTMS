import TimetableEntry from '../models/TimetableEntry.js';
import asyncHandler from 'express-async-handler';

// Get timetable by section
export const getTimetableBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const entries = await TimetableEntry.find({ section: sectionId })
    .populate('subject faculty classroom timeSlot');
  res.json({ success: true, data: entries });
});

// Check conflicts
export const checkConflicts = asyncHandler(async (req, res) => {
  const { timeSlot, faculty, classroom } = req.body;
  const conflicts = [];

  // Check faculty conflict
  const facultyConflict = await TimetableEntry.findOne({
    faculty,
    timeSlot,
  });
  if (facultyConflict) {
    conflicts.push('Faculty is already assigned to another class at this time slot');
  }

  // Check classroom conflict
  const classroomConflict = await TimetableEntry.findOne({
    classroom,
    timeSlot,
  });
  if (classroomConflict) {
    conflicts.push('Classroom is already booked at this time slot');
  }

  res.json({ success: true, data: { conflicts } });
});

// Create timetable entries
export const createTimetable = asyncHandler(async (req, res) => {
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400);
    throw new Error('Invalid timetable entries');
  }

  // Delete existing entries for the section (optional, depending on your requirements)
  await TimetableEntry.deleteMany({ section: entries[0].section });

  // Create new entries
  const createdEntries = await TimetableEntry.insertMany(entries);
  res.status(201).json({ success: true, data: createdEntries });
});
