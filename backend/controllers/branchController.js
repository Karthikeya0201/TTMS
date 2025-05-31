import asyncHandler from 'express-async-handler';
import Branch from '../models/Branch.js';

// Get all branches
export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find().lean();
  res.status(200).json({
    success: true,
    data: branches,
    message: branches.length > 0 ? 'Branches retrieved successfully' : 'No branches found',
  });
});

// Create a branch
export const createBranch = asyncHandler(async (req, res) => {
  const { name, branchCode } = req.body;
  if (!name || !branchCode) {
    res.status(400).json({
      success: false,
      message: 'All fields (name, branchCode) are required',
    });
    return;
  }
  const branch = await Branch.create({ name, branchCode });
  res.status(201).json({
    success: true,
    data: branch,
    message: 'Branch created successfully',
  });
});

// Delete a branch
export const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch) {
    res.status(404).json({
      success: false,
      message: 'Branch not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Branch deleted successfully',
  });
});