import express from 'express';
import * as subjectController from '../controllers/subjectController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', subjectController.getSubjects);
router.post('/', validate('createSubject'), subjectController.createSubject);
router.delete('/:id', subjectController.deleteSubject);

export default router;