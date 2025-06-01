import express from 'express';
import {
  createTimetable,
  checkConflicts,
  getTimetableBySection,
  getTimetableByFilters,
  getTimetableByFaculty,
  getTimetableByClassroom,
} from '../controllers/timetableController.js';

const router = express.Router();

// Create timetable entries
router.post('/', createTimetable);

// Check for conflicts
router.post('/check-conflicts', checkConflicts);

// Get timetable by section
router.get('/section/:sectionId', getTimetableBySection);

// Get timetable by batch, branch, semester, and section
router.get('/filter', getTimetableByFilters);

// Get timetable by faculty
router.get('/faculty/:facultyId', getTimetableByFaculty);

// Get timetable by classroom
router.get('/classroom/:classroomId', getTimetableByClassroom);

export default router;