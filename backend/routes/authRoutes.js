import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/login', validate('login'), authController.login);

export default router;