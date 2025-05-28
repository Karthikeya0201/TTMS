import Batch from '../models/Batch.js';
import asyncHandler from 'express-async-handler';

// Get all batches
export const getAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find().lean();
  res.json(batches);
});

// Create a batch
export const createBatch = asyncHandler(async (req, res) => {
  const { name, startYear, endYear } = req.body;
  if (!name || !startYear || !endYear) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const batch = await Batch.create({ name, startYear, endYear });
  res.status(201).json(batch);
});

// Delete a batch
export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }
  res.json({ message: 'Batch deleted' });
});