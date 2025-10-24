const joi = require('joi');

/**
 * Esquemas comunes reutilizables en todo el proyecto
 */

// email común para todos los modulos
const campoEmail = joi.string()
  .trim()
  .email({tlds: { allow: false }})// Acepta cualquier dominio, no solo .com, .net, etc.
  .lowercase()
  .required()
  .messages({
    'string.empty': 'El correo electrónico es un campo obligatorio.',
    'string.email': 'El correo electrónico debe tener un formato válido.'
  });

// contrasela común para todos los modulos

const campoPassword = joi.string()
  .min(6)
  .max(128)
  .required()
  .messages({
    'string.empty': 'La contraseña es un campo obligatorio.',
    'string.min': 'La contraseña debe tener al menos 6 caracteres.',
    'string.max': 'La contraseña no puede superar los 128 caracteres.'
  });

  // nombre común para todos los modulos

const campoNombre = joi.string()
  .trim()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.empty': 'El nombre es un campo obligatorio.',
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no puede superar los 50 caracteres.'
  })