import asyncHandler from 'express-async-handler';
import TimetableEntry from '../models/TimetableEntry.js';
import TimeSlot from '../models/TimeSlot.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';
import Branch from '../models/Branch.js';
import Batch from '../models/Batch.js';
  
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

// Get timetable by batch, branch, semester, and section
export const getTimetableByFilters = asyncHandler(async (req, res) => {
  const { batch, branch, semester, section } = req.query;

  // Validate required fields
  if (!batch || !branch || !semester || !section) {
    res.status(400).json({
      success: false,
      message: 'Missing required query parameters: batch, branch, semester, and section are required',
    });
    return;
  }

  // Verify batch exists
  const batchExists = await Batch.findById(batch);
  if (!batchExists) {
    res.status(404).json({
      success: false,
      message: `Batch not found for ID: ${batch}`,
    });
    return;
  }

  // Verify branch exists
  const branchExists = await Branch.findById(branch);
  if (!branchExists) {
    res.status(404).json({
      success: false,
      message: `Branch not found for ID: ${branch}`,
    });
    return;
  }

  // Verify semester exists and matches batch and branch
  const semesterExists = await Semester.findOne({
    _id: semester,
    batch,
    branch,
  });
  if (!semesterExists) {
    res.status(404).json({
      success: false,
      message: `Semester not found for ID: ${semester} with given batch and branch`,
    });
    return;
  }

  // Verify section exists and matches semester
  const sectionExists = await Section.findOne({
    _id: section,
    semester,
  });
  if (!sectionExists) {
    res.status(404).json({
      success: false,
      message: `Section not found for ID: ${section} with given semester`,
    });
    return;
  }

  // Fetch timetable entries for the section
  const entries = await TimetableEntry.find({ section })
    .populate('section subject faculty classroom timeSlot')
    .lean();

  res.status(200).json({
    success: true,
    data: entries,
    message: entries.length > 0 ? 'Timetable retrieved successfully' : 'No timetable entries found for the given filters',
  });
});

// Get timetable by faculty
export const getTimetableByFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const facultyExists = await Faculty.findById(facultyId);
  if (!facultyExists) {
    res.status(404).json({
      success: false,
      message: `Faculty not found for ID: ${facultyId}`,
    });
    return;
  }
  const entries = await TimetableEntry.find({ faculty: facultyId })
    .populate('section subject faculty classroom timeSlot')
    .lean();
  res.status(200).json({
    success: true,
    data: entries,
    message: entries.length > 0 ? 'Timetable retrieved successfully' : 'No timetable entries found for this faculty',
  });
});

// Get timetable by classroom
export const getTimetableByClassroom = asyncHandler(async (req, res) => {
  const { classroomId } = req.params;
  const classroomExists = await Classroom.findById(classroomId);
  if (!classroomExists) {
    res.status(404).json({
      success: false,
      message: `Classroom not found for ID: ${classroomId}`,
    });
    return;
  }
  const entries = await TimetableEntry.find({ classroom: classroomId })
    .populate('section subject faculty classroom timeSlot')
    .lean();
  res.status(200).json({
    success: true,
    data: entries,
    message: entries.length > 0 ? 'Timetable retrieved successfully' : 'No timetable entries found for this classroom',
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