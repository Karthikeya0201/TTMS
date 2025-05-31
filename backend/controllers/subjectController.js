import asyncHandler from 'express-async-handler';
import Subject from '../models/Subject.js';

// Get all subjects
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().populate('semester').lean();
  res.status(200).json({
    success: true,
    data: subjects,
    message: subjects.length > 0 ? 'Subjects retrieved successfully' : 'No subjects found',
  });
});

// Create a subject
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, semester } = req.body;
  if (!name || !code || !semester) {
    res.status(400).json({
      success: false,
      message: 'All fields (name, code, semester) are required',
    });
    return;
  }
  const subject = await Subject.create({ name, code, semester });
  await subject.populate('semester');
  res.status(201).json({
    success: true,
    data: subject,
    message: 'Subject created successfully',
  });
});

// Delete a subject
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404).json({
      success: false,
      message: 'Subject not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Subject deleted successfully',
  });
});