import TimetableEntry from '../models/TimetableEntry.js';
import TimeSlot from '../models/TimeSlot.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Section from '../models/Section.js';

// Create timetable entries (admin only)
export const createTimetable = async (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid entries provided' });
    }

    const savedEntries = [];
    for (const entry of entries) {
      const { section, subject, faculty, classroom, timeSlot } = entry;
      if (!section || !subject || !faculty || !classroom || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const timeSlotExists = await TimeSlot.findById(timeSlot);
      if (!timeSlotExists) {
        return res.status(400).json({ success: false, message: `Invalid time slot ID: ${timeSlot}` });
      }

      const conflicts = await checkTimetableConflicts({ timeSlot, faculty, classroom });
      if (conflicts.length > 0) {
        return res.status(400).json({ success: false, message: 'Conflicts detected', data: { conflicts } });
      }

      const newEntry = new TimetableEntry({ section, subject, faculty, classroom, timeSlot });
      await newEntry.save();
      savedEntries.push(newEntry);
    }

    return res.status(201).json({
      success: true,
      message: 'Timetable entries created successfully',
      data: savedEntries,
    });
  } catch (error) {
    console.error('Create Timetable Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Check for timetable conflicts
export const checkConflicts = async (req, res) => {
  try {
    const { timeSlot, faculty, classroom } = req.body;
    if (!timeSlot || !faculty || !classroom) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const conflicts = await checkTimetableConflicts({ timeSlot, faculty, classroom });
    return res.status(200).json({
      success: true,
      message: conflicts.length > 0 ? 'Conflicts found' : 'No conflicts',
      data: { conflicts },
    });
  } catch (error) {
    console.error('Check Conflicts Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Helper function to check conflicts
async function checkTimetableConflicts({ timeSlot, faculty, classroom }) {
  const conflicts = [];
  const facultyConflict = await TimetableEntry.findOne({ timeSlot, faculty }).populate('section subject');
  if (facultyConflict) {
    const section = facultyConflict.section.name;
    const subject = facultyConflict.subject.name;
    conflicts.push(`Faculty is already assigned to ${subject} in section ${section} at this time slot`);
  }

  const classroomConflict = await TimetableEntry.findOne({ timeSlot, classroom }).populate('section subject');
  if (classroomConflict) {
    const section = classroomConflict.section.name;
    const subject = classroomConflict.subject.name;
    conflicts.push(`Classroom is already booked for ${subject} in section ${section} at this time slot`);
  }

  return conflicts;
}

// Get timetable by section
export const getTimetableBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const entries = await TimetableEntry.find({ section: sectionId })
      .populate('section subject faculty classroom timeSlot')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Timetable fetched successfully',
      data: entries,
    });
  } catch (error) {
    console.error('Get Timetable Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};