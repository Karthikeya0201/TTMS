import express from 'express';
import batchRoutes from './batchRoutes.js';
import branchRoutes from './branchRoutes.js';
import semesterRoutes from './semesterRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import classroomRoutes from './classroomRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import timeslotRoutes from './timeslotRoutes.js';
import authRoutes from './authRoutes.js';
import sectionRoutes from './sectionRoutes.js';

const router = express.Router();

router.use('/batches', batchRoutes);
router.use('/branches', branchRoutes);
router.use('/semesters', semesterRoutes);
router.use('/subjects', subjectRoutes);
router.use('/faculties', facultyRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/timetable', timetableRoutes);
router.use('/timeslots', timeslotRoutes);
router.use('/auth', authRoutes);
router.use('/sections', sectionRoutes);

export default router;