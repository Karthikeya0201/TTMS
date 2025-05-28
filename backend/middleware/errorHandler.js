import express from 'express';
import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Don't leak error details in production
  const response = {
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate record found'
    });
  }

  // Validation Errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(val => val.message).join(', ')
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }

  // Default error
  res.status(err.status || 500).json(response);
};

export default errorHandler;