import express from 'express';
import * as classroomController from '../controllers/classroomController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', classroomController.getClassrooms);
router.post('/', validate('createClassroom'), classroomController.createClassroom);
router.delete('/:id', classroomController.deleteClassroom);

export default router;