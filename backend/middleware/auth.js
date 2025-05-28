import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const auth = (requiredRole) => asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // Optional: exclude password

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (requiredRole && user.role !== requiredRole) {
      res.status(403);
      throw new Error('Access denied');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
});
