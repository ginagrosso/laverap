/**
 * Middleware genérico para validar datos con Joi
 * Permite validar body, params o query de una request
 */

/**
 * @param {Object} schema - Schema de Joi a usar para validar
 * @param {string} property - Qué parte del request validar: 'body', 'params' o 'query'
 * @returns {Function} Middleware de Express
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Validar los datos según el schema
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,  // Devuelve todos los errores, no solo el primero
      stripUnknown: true  // Elimina campos que no están en el schema
    });

    // Si hay errores, devolver 400 con los mensajes
    if (error) {
      const errores = error.details.map(err => err.message);
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errores
      });
    }

    // Reemplazar los datos del request con los valores validados
    req[property] = value;
    
    // Continuar al siguiente middleware/controller
    next();
  };
};

module.exports = { validate };