import Section from '../models/Section.js';
import asyncHandler from 'express-async-handler';

// Get all sections
export const getAllSections = asyncHandler(async (req, res) => {
  const sections = await Section.find().populate('semester');
  res.json(sections);
});

// Create a section
export const createSection = asyncHandler(async (req, res) => {
  const { name, semester } = req.body;
  const section = new Section({ name, semester });
  const createdSection = await section.save();
  res.status(201).json(createdSection);
});