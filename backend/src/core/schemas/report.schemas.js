const joi = require('joi');

// Schema para validar rango de fechas en query params
const rangoFechasSchema = joi.object({
  desde: joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'La fecha "desde" debe tener formato YYYY-MM-DD.'
    }),
  hasta: joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'La fecha "hasta" debe tener formato YYYY-MM-DD.'
    })
});

// Schema para validar límite en top rankings
const limiteTopSchema = joi.object({
  limite: joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      'number.min': 'El límite debe ser al menos 1.',
      'number.max': 'El límite no puede superar 50.',
      'number.base': 'El límite debe ser un número.'
    })
});

module.exports = {
  rangoFechasSchema,
  limiteTopSchema
};
