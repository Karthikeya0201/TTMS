import Subject from '../models/Subject.js';
import asyncHandler from 'express-async-handler';

// Get all subjects
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().populate('semester');
  res.json(subjects);
});

// Create a subject
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, semester } = req.body;
  if (!name || !code || !semester) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const subject = await Subject.create({ name, code, semester });
  res.status(201).json(subject);
});

// Delete a subject
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.json({ message: 'Subject deleted' });
});