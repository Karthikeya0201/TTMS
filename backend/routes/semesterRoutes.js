import express from 'express';
import * as semesterController from '../controllers/semesterController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', semesterController.getSemesters);
router.post('/', validate('createSemester'), semesterController.createSemester);
router.delete('/:id', auth('admin'), semesterController.deleteSemester);

export default router;