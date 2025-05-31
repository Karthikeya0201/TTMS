import asyncHandler from 'express-async-handler';
import Semester from '../models/Semester.js';

// Get all semesters
export const getSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.find().populate('batch branch').lean();
  res.status(200).json({
    success: true,
    data: semesters,
    message: semesters.length > 0 ? 'Semesters retrieved successfully' : 'No semesters found',
  });
});

// Create a semester
export const createSemester = asyncHandler(async (req, res) => {
  const { name, branch, batch } = req.body;
  if (!name || !branch || !batch) {
    res.status(400).json({
      success: false,
      message: 'All fields (name, branch, batch) are required',
    });
    return;
  }
  const semester = await Semester.create({ name, branch, batch });
  await semester.populate('batch branch');
  res.status(201).json({
    success: true,
    data: semester,
    message: 'Semester created successfully',
  });
});

// Delete a semester
export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByIdAndDelete(req.params.id);
  if (!semester) {
    res.status(404).json({
      success: false,
      message: 'Semester not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Semester deleted successfully',
  });
});