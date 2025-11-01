const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');

// Middleware genérico para validar datos con Joi
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Validar los datos según el schema
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true
    });

    // Si hay errores de validación, crear AppError
    if (error) {
      const errores = error.details.map(err => err.message);
      
      return next(new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Errores de validación',
        400,
        true,
        errores
      ));
    }

    // Reemplazar los datos del request con los valores validados
    req[property] = value;
    
    next();
  };
};

module.exports = { validate };