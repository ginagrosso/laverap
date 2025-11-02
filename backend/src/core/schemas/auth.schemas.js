const joi = require('joi');

/**
 * Schema para registro de usuarios
 * Campos obligatorios: nombre, email, password
 * Campos opcionales: telefono, direccion, rol
 */
const registroSchema = joi.object({
  nombre: joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es obligatorio.',
      'string.min': 'El nombre debe tener al menos 2 caracteres.',
      'string.max': 'El nombre no puede superar los 100 caracteres.'
    }),
  
  email: joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'El email es obligatorio.',
      'string.email': 'El email debe ser válido.'
    }),
  
  password: joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.empty': 'La contraseña es obligatoria.',
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
      'string.max': 'La contraseña no puede superar los 100 caracteres.'
    }),
  
  telefono: joi.string()
    .trim()
    .pattern(/^[0-9]{7,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe contener entre 7 y 15 dígitos.'
    }),
  
  direccion: joi.string()
    .trim()
    .min(5)
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.min': 'La dirección debe tener al menos 5 caracteres.',
      'string.max': 'La dirección no puede superar los 200 caracteres.'
    }),
  
  rol: joi.string()
    .valid('cliente', 'admin', 'operario')
    .default('cliente')
    .messages({
      'any.only': 'El rol debe ser cliente, admin u operario.'
    })
});

/**
 * Schema para login de usuarios
 * Solo requiere email y password
 */
const loginSchema = joi.object({
  email: joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'El email es obligatorio.',
      'string.email': 'El email debe ser válido.'
    }),
  
  password: joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es obligatoria.'
    })
});

module.exports = {
  registroSchema,
  loginSchema
};
