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
  });

// Teléfono común para todos los módulos
const campoTelefono = joi.string()
  .trim()
  .pattern(/^[0-9]{10,15}$/)
  .optional()
  .messages({
    'string.pattern.base': 'El teléfono debe tener entre 10 y 15 dígitos numéricos.',
  });

// Dirección común para todos los módulos
const campoDireccion = joi.string()
  .trim()
  .min(5)
  .max(200)
  .optional()
  .messages({
    'string.min': 'La dirección debe tener al menos 5 caracteres.',
    'string.max': 'La dirección no puede superar los 200 caracteres.'
  });

// ID de Firebase común (22 caracteres alfanuméricos)
const campoFirebaseId = joi.string()
  .trim()
  .length(20)
  .required()
  .messages({
    'string.empty': 'El ID es un campo obligatorio.',
    'string.length': 'El ID debe tener exactamente 20 caracteres.'
  });

// Observaciones/Comentarios opcionales
const campoObservaciones = joi.string()
  .trim()
  .max(500)
  .optional()
  .allow('', null)
  .messages({
    'string.max': 'Las observaciones no pueden superar los 500 caracteres.'
  });

// Estado de pedido (enum)
const campoEstadoPedido = joi.string()
  .valid('Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado')
  .required()
  .messages({
    'any.only': 'El estado debe ser: Pendiente, En Proceso, Finalizado, Entregado o Cancelado.',
    'string.empty': 'El estado es un campo obligatorio.'
  });

// Precio (número positivo con hasta 2 decimales)
const campoPrecio = joi.number()
  .positive()
  .precision(2)
  .required()
  .messages({
    'number.base': 'El precio debe ser un número.',
    'number.positive': 'El precio debe ser mayor a 0.',
    'any.required': 'El precio es un campo obligatorio.'
  });

// Precio para opciones de servicios (permite 0 para "sin cargo adicional")
const campoPrecioOpcion = joi.number()
  .min(0)
  .precision(2)
  .required()
  .messages({
    'number.base': 'El precio debe ser un número.',
    'number.min': 'El precio no puede ser negativo.',
    'any.required': 'El precio es un campo obligatorio.'
  });

module.exports = {
  campoEmail,
  campoPassword,
  campoNombre,
  campoTelefono,
  campoDireccion,
  campoFirebaseId,
  campoObservaciones,
  campoEstadoPedido,
  campoPrecio,
  campoPrecioOpcion
};