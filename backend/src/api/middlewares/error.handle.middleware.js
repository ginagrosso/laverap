const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');
const ERROR_MESSAGES = require('../../core/errors/error.messages');

// Middleware que captura todos los errores
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.code = err.code || ERROR_CODES.SYSTEM_UNKNOWN_ERROR;
  error.statusCode = err.statusCode || 500;

  // Log del error en consola (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      code: error.code,
      message: error.message,
      stack: err.stack,
      details: error.details
    });
  }

  // Errores de Joi (validación)
  if (err.name === 'ValidationError' && err.isJoi) {
    error.code = ERROR_CODES.VALIDATION_ERROR;
    error.statusCode = 400;
    error.details = err.details?.map(d => d.message) || [];
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    error.code = ERROR_CODES.AUTH_TOKEN_INVALID;
    error.statusCode = 401;
    error.message = ERROR_MESSAGES[ERROR_CODES.AUTH_TOKEN_INVALID];
  }

  if (err.name === 'TokenExpiredError') {
    error.code = ERROR_CODES.AUTH_TOKEN_EXPIRED;
    error.statusCode = 401;
    error.message = ERROR_MESSAGES[ERROR_CODES.AUTH_TOKEN_EXPIRED];
  }

  // Respuesta al cliente
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: ERROR_MESSAGES[error.code] || error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;