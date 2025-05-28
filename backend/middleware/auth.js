import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT and optionally check user role.
 * @param {string} [requiredRole] - Role required to access the route (optional).
 */
export const auth = (requiredRole) => asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header is present and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('No token provided');
  }

  // Extract token string from header
  const token = authHeader.split(' ')[1];

  try {
    // Verify token with JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // decoded should have an 'id' property identifying the user
    if (!decoded || !decoded.id) {
      res.status(401);
      throw new Error('Invalid token');
    }

    // Find user by ID in the database, exclude password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // If a required role is specified, check if the user's role matches
    if (requiredRole && user.role !== requiredRole) {
      res.status(403);
      throw new Error('Access denied: insufficient permissions');
    }

    // Attach user info to request object for use in route handlers
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
});
