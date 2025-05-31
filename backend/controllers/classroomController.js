import asyncHandler from 'express-async-handler';
import Classroom from '../models/Classroom.js';

// Get all classrooms
export const getClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find().lean();
  res.status(200).json({
    success: true,
    data: classrooms,
    message: classrooms.length > 0 ? 'Classrooms retrieved successfully' : 'No classrooms found',
  });
});

// Create a classroom
export const createClassroom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !capacity) {
    res.status(400).json({
      success: false,
      message: 'All fields (name, capacity) are required',
    });
    return;
  }
  const classroom = await Classroom.create({ name, capacity });
  res.status(201).json({
    success: true,
    data: classroom,
    message: 'Classroom created successfully',
  });
});

// Delete a classroom
export const deleteClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByIdAndDelete(req.params.id);
  if (!classroom) {
    res.status(404).json({
      success: false,
      message: 'Classroom not found',
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: null,
    message: 'Classroom deleted successfully',
  });
});