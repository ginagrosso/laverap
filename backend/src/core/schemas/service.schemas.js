const joi = require('joi');
const { campoNombre, campoPrecio, campoFirebaseId } = require('./common.schemas');

/**
 * Esquemas de validación para el módulo de servicios
 */

// Schema para crear/actualizar un servicio
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
  
  configuracionPrecios: joi.object({
    // Para modelo "paqueteConAdicional"
    paqueteBase: joi.object({
      nombre: joi.string().required(),
      precio: campoPrecio
    }).optional(),
    
    adicionales: joi.array().items(
      joi.object({
        nombre: joi.string().required(),
        precio: campoPrecio
      })
    ).optional(),
    
    // Para modelo "porOpcionesMultiples"
    opciones: joi.array().items(
      joi.object({
        nombre: joi.string().required(),
        precio: campoPrecio
      })
    ).optional(),
    
    precioBase: campoPrecio.optional(),
    
    // Para modelo "porOpciones"
    opcionesSimples: joi.array().items(
      joi.object({
        nombre: joi.string().required(),
        precio: campoPrecio
      })
    ).optional()
  })
    .required()
    .messages({
      'object.base': 'La configuración de precios debe ser un objeto.',
      'any.required': 'La configuración de precios es obligatoria.'
    }),
  
  activo: joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'El campo activo debe ser verdadero o falso.'
    }),
  
  imagen: joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'La URL de la imagen no es válida.'
    })
});

// Schema para obtener servicio por ID (parámetro de ruta)
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