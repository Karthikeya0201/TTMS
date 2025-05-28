import express from 'express';
import * as facultyController from '../controllers/facultyController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', facultyController.getFaculties);
router.post('/', validate('createFaculty'), facultyController.createFaculty);
router.delete('/:id', facultyController.deleteFaculty);

export default router;