import asyncHandler from 'express-async-handler';
import Batch from '../models/Batch.js';

export const getAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find().lean();
  res.status(200).json({
    success: true,
    data: batches,
    message: batches.length > 0 ? 'Batches retrieved successfully' : 'No batches found',
  });
});

export const createBatch = asyncHandler(async (req, res) => {
  const { name, startYear, endYear } = req.body;
  if (!name || !startYear || !endYear) {
    res.status(400).json({
      success: false,
      message: 'All fields (name, startYear, endYear) are required',
    });
    return;
  }
  const batch = await Batch.create({ name, startYear, endYear });
  res.status(201).json({
    success: true,
    data: batch,
    message: 'Batch created successfully',
  });
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    res.status(404).json({
      success: false,
      message: 'Batch not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Batch deleted successfully',
  });
});