import express from 'express';
import * as sectionController from '../controllers/sectionController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/',  sectionController.getAllSections);
router.post('/', auth('admin'), validate('createSection'), sectionController.createSection);

export default router;