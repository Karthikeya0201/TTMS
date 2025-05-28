import Branch from '../models/Branch.js';
import asyncHandler from 'express-async-handler';

// Get all branches
export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find().lean();
  res.json(branches);
});

// Create a branch
export const createBranch = asyncHandler(async (req, res) => {
  const { name, branchCode } = req.body;
  if (!name || !branchCode) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const branch = await Branch.create({ name, branchCode });
  res.status(201).json(branch);
});

// Delete a branch
export const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }
  res.json({ message: 'Branch deleted' });
});