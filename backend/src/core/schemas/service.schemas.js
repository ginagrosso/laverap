const joi = require('joi');
const { campoNombre, campoPrecio, campoPrecioOpcion, campoFirebaseId } = require('./common.schemas');

// Schema principal que valida según el modelo de precio
const servicioSchema = joi.object({
  nombre: campoNombre.messages({
    'string.empty': 'El nombre del servicio es obligatorio.',
    'string.min': 'El nombre del servicio debe tener al menos 2 caracteres.',
    'string.max': 'El nombre del servicio no puede superar los 50 caracteres.'
  }),
  
  descripcion: joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La descripción del servicio es obligatoria.',
      'string.min': 'La descripción debe tener al menos 10 caracteres.',
      'string.max': 'La descripción no puede superar los 500 caracteres.'
    }),
  
  modeloDePrecio: joi.string()
    .valid('paqueteConAdicional', 'porOpcionesMultiples', 'porOpciones')
    .required()
    .messages({
      'any.only': 'El modelo de precio debe ser: paqueteConAdicional, porOpcionesMultiples o porOpciones.',
      'string.empty': 'El modelo de precio es obligatorio.'
    }),
  
  activo: joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'El campo activo debe ser verdadero o falso.'
    }),
  
  // Campos condicionales según el modelo de precio
  precioBase: joi.when('modeloDePrecio', {
    is: joi.string().valid('paqueteConAdicional', 'porOpcionesMultiples'),
    then: campoPrecio.required().messages({
      'any.required': 'El precio base es obligatorio para este modelo.'
    }),
    otherwise: joi.forbidden()
  }),
  
  adicionales: joi.when('modeloDePrecio', {
    is: 'paqueteConAdicional',
    then: joi.object()
      .pattern(joi.string(), campoPrecioOpcion)
      .required()
      .messages({
        'object.base': 'Los adicionales deben ser un objeto.',
        'any.required': 'Los adicionales son obligatorios para este modelo.'
      }),
    otherwise: joi.forbidden()
  }),
  
  opciones: joi.when('modeloDePrecio', {
    is: 'porOpciones',
    then: joi.object()
      .pattern(joi.string(), campoPrecioOpcion)
      .required()
      .messages({
        'object.base': 'Las opciones deben ser un objeto.',
        'any.required': 'Las opciones son obligatorias para este modelo.'
      }),
    otherwise: joi.when('modeloDePrecio', {
      is: 'porOpcionesMultiples',
      then: joi.object()
        .pattern(
          joi.string(),
          joi.object().pattern(joi.string(), campoPrecioOpcion)
        )
        .required()
        .messages({
          'object.base': 'Las opciones deben ser un objeto.',
          'any.required': 'Las opciones son obligatorias para este modelo.'
        }),
      otherwise: joi.forbidden()
    })
  }),
  
  minimoUnidades: joi.when('modeloDePrecio', {
    is: 'porOpcionesMultiples',
    then: joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'El mínimo de unidades debe ser un número.',
        'number.min': 'El mínimo de unidades debe ser al menos 1.',
        'any.required': 'El mínimo de unidades es obligatorio para este modelo.'
      }),
    otherwise: joi.forbidden()
  })
});

// Schema para obtener servicio por ID
const obtenerServicioPorIdSchema = joi.object({
  id: campoFirebaseId.messages({
    'string.empty': 'El ID del servicio es obligatorio.',
    'string.length': 'El ID del servicio no es válido.'
  })
});

module.exports = {
  servicioSchema,
  obtenerServicioPorIdSchema
};