// Clase personalizada para errores de la aplicación
class AppError extends Error {
  constructor(code, message, statusCode = 500, isOperational = true, details = null) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Errores controlados vs bugs
    this.details = details; // Info adicional (ej: campos de validación)
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;