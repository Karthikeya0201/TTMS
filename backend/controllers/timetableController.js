import asyncHandler from 'express-async-handler';
import TimetableEntry from '../models/TimetableEntry.js';
import TimeSlot from '../models/TimeSlot.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Section from '../models/Section.js';

// Create timetable entries
export const createTimetable = asyncHandler(async (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No valid entries provided',
    });
    return;
  }
  const savedEntries = [];
  for (const entry of entries) {
    const { section, subject, faculty, classroom, timeSlot } = entry;
    if (!section || !subject || !faculty || !classroom || !timeSlot) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields in entry',
      });
      return;
    }
    const timeSlotExists = await TimeSlot.findById(timeSlot);
    if (!timeSlotExists) {
      res.status(400).json({
        success: false,
        message: `Invalid time slot ID: ${timeSlot}`,
      });
      return;
    }
    const conflicts = await checkTimetableConflicts({ timeSlot, faculty, classroom });
    if (conflicts.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Conflicts detected',
        data: { conflicts },
      });
      return;
    }
    const newEntry = await TimetableEntry.create({ section, subject, faculty, classroom, timeSlot });
    await newEntry.populate('section subject faculty classroom timeSlot');
    savedEntries.push(newEntry);
  }
  res.status(201).json({
    success: true,
    data: savedEntries,
    message: 'Timetable entries created successfully',
  });
});

// Check for timetable conflicts
export const checkConflicts = asyncHandler(async (req, res) => {
  const { timeSlot, faculty, classroom } = req.body;
  if (!timeSlot || !faculty || !classroom) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
    return;
  }
  const conflicts = await checkTimetableConflicts({ timeSlot, faculty, classroom });
  res.status(200).json({
    success: true,
    data: { conflicts },
    message: conflicts.length > 0 ? 'Conflicts found' : 'No conflicts',
  });
});

// Get timetable by section
export const getTimetableBySection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const section = await Section.findById(sectionId);
  if (!section) {
    res.status(404).json({
      success: false,
      message: 'Section not found',
    });
    return;
  }
  const entries = await TimetableEntry.find({ section: sectionId })
    .populate('section subject faculty classroom timeSlot')
    .lean();
  res.status(200).json({
    success: true,
    data: entries,
    message: entries.length > 0 ? 'Timetable retrieved successfully' : 'No timetable entries found',
  });
});

// Helper function to check conflicts
async function checkTimetableConflicts({ timeSlot, faculty, classroom }) {
  const conflicts = [];
  const facultyConflict = await TimetableEntry.findOne({ timeSlot, faculty })
    .populate('section subject')
    .lean();
  if (facultyConflict) {
    const section = facultyConflict.section?.name || 'Unknown';
    const subject = facultyConflict.subject?.name || 'Unknown';
    conflicts.push(`Faculty is already assigned to ${subject} in section ${section} at this time slot`);
  }
  const classroomConflict = await TimetableEntry.findOne({ timeSlot, classroom })
    .populate('section subject')
    .lean();
  if (classroomConflict) {
    const section = classroomConflict.section?.name || 'Unknown';
    const subject = classroomConflict.subject?.name || 'Unknown';
    conflicts.push(`Classroom is already booked for ${subject} in section ${section} at this time slot`);
  }
  return conflicts;
}