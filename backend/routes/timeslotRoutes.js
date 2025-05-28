import express from 'express';
import * as timeslotController from '../controllers/timeslotController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', timeslotController.getTimeSlots);
router.post('/', validate('createTimeSlot'), timeslotController.createTimeSlot);
router.delete('/:id', timeslotController.deleteTimeSlot);

export default router;