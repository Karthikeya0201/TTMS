import Classroom from '../models/Classroom.js';
import asyncHandler from 'express-async-handler';

// Get all classrooms
export const getClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find();
  res.json(classrooms);
});

// Create a classroom
export const createClassroom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !capacity) {
    res.status(400);
    throw new Error('All fields are required');
  }
  const classroom = await Classroom.create({ name, capacity });
  res.status(201).json(classroom);
});

// Delete a classroom
export const deleteClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findByIdAndDelete(req.params.id);
  if (!classroom) {
    res.status(404);
    throw new Error('Classroom not found');
  }
  res.json({ message: 'Classroom deleted' });
});