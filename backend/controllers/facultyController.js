import asyncHandler from 'express-async-handler';
import Faculty from '../models/Faculty.js';

// Get all faculties
export const getFaculties = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find().populate('subjects').lean();
  res.status(200).json({
    success: true,
    data: faculties,
    message: faculties.length > 0 ? 'Faculties retrieved successfully' : 'No faculties found',
  });
});

// Create a faculty
export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, subjects } = req.body;
  if (!name || !email) {
    res.status(400).json({
      success: false,
      message: 'Name and email are required',
    });
    return;
  }
  const faculty = await Faculty.create({ name, email, subjects: subjects || [] });
  await faculty.populate('subjects');
  res.status(201).json({
    success: true,
    data: faculty,
    message: 'Faculty created successfully',
  });
});

// Delete a faculty
export const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndDelete(req.params.id);
  if (!faculty) {
    res.status(404).json({
      success: false,
      message: 'Faculty not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Faculty deleted successfully',
  });
});