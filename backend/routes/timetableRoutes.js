import express from 'express';
import * as timetableController from '../controllers/timetableController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get timetable by section
router.get('/section/:sectionId', timetableController.getTimetableBySection);

// Check conflicts
router.post('/check-conflicts', validate('checkConflicts'), timetableController.checkConflicts);

// Save timetable entries
router.post('/', validate('createTimetable'), auth('admin'), timetableController.createTimetable);

export default router;