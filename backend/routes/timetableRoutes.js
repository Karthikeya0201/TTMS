// routes/timetable.js
import express from 'express';
import * as timetableController from '../controllers/timetableController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get timetable by section
router.get('/section/:sectionId', timetableController.getTimetableBySection);

// Check conflicts
router.post('/check-conflicts', timetableController.checkConflicts);

// Save timetable entries (admin only)
router.post('/', auth('admin'), timetableController.createTimetable);

export default router;