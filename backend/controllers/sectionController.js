import asyncHandler from 'express-async-handler';
import Section from '../models/Section.js';
import Semester from '../models/Semester.js';

// Get all sections
export const getAllSections = asyncHandler(async (req, res) => {
  const sections = await Section.find()
    .populate({
      path: 'semester',
      populate: [{ path: 'branch' }, { path: 'batch' }],
    })
    .lean();
  res.status(200).json({
    success: true,
    data: sections,
    message: sections.length > 0 ? 'Sections retrieved successfully' : 'No sections found',
  });
});

// Create a section
export const createSection = asyncHandler(async (req, res) => {
  const { name, semester } = req.body;
  if (!name || !semester) {
    res.status(400).json({
      success: false,
      message: 'Name and semester are required',
    });
    return;
  }
  const semesterExists = await Semester.findById(semester);
  if (!semesterExists) {
    res.status(404).json({
      success: false,
      message: 'Semester not found',
    });
    return;
  }
  const section = await Section.create({ name, semester });
  await section.populate({
    path: 'semester',
    populate: [{ path: 'branch' }, { path: 'batch' }],
  });
  res.status(201).json({
    success: true,
    data: section,
    message: 'Section created successfully',
  });
});

// Delete a section
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    res.status(404).json({
      success: false,
      message: 'Section not found',
    });
    return;
  }
  await section.deleteOne();
  res.status(200).json({
    success: true,
    data: null,
    message: 'Section deleted successfully',
  });
});