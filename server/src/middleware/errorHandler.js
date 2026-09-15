import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, path: req.originalUrl, method: req.method });

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate value entered for ${field}`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  // Handle Zod validation errors
  if (err.errors && Array.isArray(err.errors)) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
