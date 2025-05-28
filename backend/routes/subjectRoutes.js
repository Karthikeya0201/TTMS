import express from 'express';
import * as subjectController from '../controllers/subjectController.js';
import { validate, validateResult } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes with authentication middleware

router.get('/', subjectController.getSubjects);
router.post('/', validate('createSubject'), validateResult, subjectController.createSubject);
router.put('/:id', validate('createSubject'), validateResult); // Add update route
router.delete('/:id', subjectController.deleteSubject);

export default router;