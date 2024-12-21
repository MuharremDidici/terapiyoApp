import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // API Error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validasyon hatası',
      errors
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `Bu ${field} zaten kullanımda`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Geçersiz token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token süresi doldu'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Sunucu hatası' : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    message
  });
};
