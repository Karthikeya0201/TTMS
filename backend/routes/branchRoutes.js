import express from 'express';
import * as branchController from '../controllers/branchController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', branchController.getAllBranches);
router.post('/', validate('createBranch'), branchController.createBranch);
router.delete('/:id', branchController.deleteBranch);

export default router;