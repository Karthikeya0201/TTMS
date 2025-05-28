import express from 'express';
import * as batchController from '../controllers/batchController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.get('/',batchController.getAllBatches);
router.post('/', validate('createBatch'), batchController.createBatch);
router.delete('/:id', batchController.deleteBatch);

export default router;