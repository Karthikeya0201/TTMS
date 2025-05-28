import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT and optionally check user role.
 * @param {string} [requiredRole] - Role required to access the route (optional).
 * @returns {Function} Express middleware function
 */
export const auth = (requiredRole) => asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }
    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET is not set in environment variables');
    }

    // Verify token with JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure'
      });
    }    // Find user by ID in the database, exclude password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or has been deleted'
      });
    }

    // If a required role is specified, check if the user's role matches
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
    }

    // Attach user info to request object for use in route handlers
    req.user = user;
    next();
    
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
});
