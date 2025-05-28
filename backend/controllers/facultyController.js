import Faculty from '../models/Faculty.js';
import asyncHandler from 'express-async-handler';

// Get all faculties
export const getFaculties = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find().populate('subjects');
  res.json(faculties);
});

// Create a faculty
export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, subjects } = req.body;
  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required');
  }
  const faculty = await Faculty.create({ name, email, subjects: subjects || [] });
  res.status(201).json(faculty);
});

// Delete a faculty
export const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndDelete(req.params.id);
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json({ message: 'Faculty deleted' });
});