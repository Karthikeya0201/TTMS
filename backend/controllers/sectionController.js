import asyncHandler from 'express-async-handler';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js'; // Assuming you have a Semester model

// Get all sections
export const getAllSections = asyncHandler(async (req, res) => {
  const sections = await Section.find().populate({
    path: 'semester',
    populate: [
      { path: 'branch' }, // Populate the branch field in Semester
      { path: 'batch' },  // Populate the batch field in Semester
    ],
  });
  res.json(sections);
});

// Create a section
export const createSection = asyncHandler(async (req, res) => {
  const { name, semester } = req.body;

  // Validate required fields
  if (!name || !semester) {
    res.status(400);
    throw new Error('Name and semester are required');
  }

  // Check if the semester exists
  const semesterExists = await Semester.findById(semester);
  if (!semesterExists) {
    res.status(404);
    throw new Error('Semester not found');
  }

  // Create the section
  const section = new Section({ name, semester });
  const createdSection = await section.save();

  // Populate the semester field (including branch and batch) in the response
  await createdSection.populate({
    path: 'semester',
    populate: [
      { path: 'branch' },
      { path: 'batch' },
    ],
  });

  res.status(201).json(createdSection);
});

// Delete a section (for completeness, since the frontend uses it)
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  await section.deleteOne();
  res.json({ message: 'Section deleted successfully' });
});