const joi = require('joi');
const { campoPrecio } = require('./common.schemas');

/**
 * Esquemas de validación para el módulo de pagos
 */

/**
 * Schema para registrar un pago en el local
 * Usado en: POST /api/v1/orders/:id/payment (Endpoint por crear)
 */
const registrarPagoSchema = joi.object({
  // Método de pago utilizado por el cliente
  metodo: joi.string()
    .valid('efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia')
    .required()
    .messages({
      'any.only': 'El método de pago debe ser: efectivo, tarjeta_debito, tarjeta_credito o transferencia.',
      'string.empty': 'El método de pago es obligatorio.'
    }),
  
  // Monto efectivamente pagado por el cliente
  monto: campoPrecio.messages({
    'number.base': 'El monto debe ser un número.',
    'number.positive': 'El monto debe ser mayor a 0.',
    'any.required': 'El monto es obligatorio.'
  }),
  
  // Observaciones opcionales sobre el pago (ej: "Pagó con billete de $10000")
  observaciones: joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Las observaciones no pueden superar los 500 caracteres.'
    })
});

module.exports = {
  registrarPagoSchema
};
