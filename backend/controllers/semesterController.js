import Semester from '../models/Semester.js';
import asyncHandler from 'express-async-handler';

// Get all semesters
export const getSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.find().lean().populate('batch').populate('branch');
  res.json(semesters);
});

// Create a semester
export const createSemester = asyncHandler(async (req, res) => {
  const { name, branch, batch } = req.body;
  if (!name || !branch || !batch) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const semester = await Semester.create({ name, branch, batch });
  res.status(201).json(semester);
});

// Delete a semester
export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByIdAndDelete(req.params.id);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.json({ message: 'Semester deleted' });
});