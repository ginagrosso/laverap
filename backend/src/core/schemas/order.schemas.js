const joi = require('joi');
const { campoFirebaseId, campoObservaciones } = require('./common.schemas');

/**
 * Esquemas de validación para el módulo de pedidos
 */

// Schema para crear un nuevo pedido
const crearPedidoSchema = joi.object({
  clienteId: campoFirebaseId.optional().messages({
    'string.length': 'El ID del cliente no es válido.'
  }),
  
  servicioId: campoFirebaseId.messages({
    'string.empty': 'El ID del servicio es obligatorio.',
    'string.length': 'El ID del servicio no es válido.'
  }),
  
  detalle: joi.alternatives().try(
    // Opción 1: Objeto (para paqueteConAdicional y porOpciones)
    joi.object({
      // Para modelo "paqueteConAdicional" - adicionales como array de strings
      adicionales: joi.array().items(joi.string()).optional(),
      
      // Para modelo "porOpciones" - una sola opción seleccionada
      opcion: joi.string().optional(),
      opcionSeleccionada: joi.string().optional(), // Alias alternativo
    })
      .unknown(true) // Permite categorías dinámicas para porOpcionesMultiples (Tipo, Tamaño, etc.)
      .messages({
        'object.base': 'El detalle del pedido debe ser un objeto válido.'
      }),
    
    // Opción 2: Array de objetos (para porOpcionesMultiples con múltiples items)
    joi.array().items(
      joi.object({
        opcionesSeleccionadas: joi.object().pattern(joi.string(), joi.string()).required(),
        cantidad: joi.number().integer().min(1).required()
      })
    )
  )
    .required()
    .messages({
      'any.required': 'El detalle del pedido es obligatorio.'
    }),
  
  observaciones: campoObservaciones
})
  .messages({
    'object.base': 'Los datos del pedido no son válidos.'
  });

// Schema para actualizar el estado de un pedido (solo admin)
const actualizarEstadoPedidoSchema = joi.object({
  estado: joi.string()
    .valid('Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado')
    .required()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, En Proceso, Finalizado, Entregado o Cancelado.',
      'string.empty': 'El estado es un campo obligatorio.'
    }),
  
  observaciones: campoObservaciones
});

// Schema para actualizar cualquier campo de un pedido (solo admin)
const actualizarPedidoSchema = joi.object({
  servicioId: campoFirebaseId.optional().messages({
    'string.length': 'El ID del servicio no es válido.'
  }),
  
  detalle: joi.alternatives().try(
    joi.object().unknown(true),
    joi.array().items(
      joi.object({
        opcionesSeleccionadas: joi.object().pattern(joi.string(), joi.string()).required(),
        cantidad: joi.number().integer().min(1).required()
      })
    )
  ).optional(),
  
  observaciones: campoObservaciones.allow('').optional(),
  
  estado: joi.string()
    .valid('Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, En Proceso, Finalizado, Entregado o Cancelado.'
    }),
  
  precioEstimado: joi.number().min(0).optional().messages({
    'number.min': 'El precio no puede ser negativo.'
  })
}).min(1).messages({
  'object.min': 'Debe enviar al menos un campo para actualizar.'
});

// Schema para obtener pedido por ID (parámetro de ruta)
const obtenerPedidoPorIdSchema = joi.object({
  id: campoFirebaseId.messages({
    'string.empty': 'El ID del pedido es obligatorio.',
    'string.length': 'El ID del pedido no es válido.'
  })
});

// Schema para filtrar pedidos por estado (query params)
const filtrarPedidosPorEstadoSchema = joi.object({
  estado: joi.string()
    .valid('Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, En Proceso, Finalizado, Entregado o Cancelado.'
    })
});

module.exports = {
  crearPedidoSchema,
  actualizarEstadoPedidoSchema,
  actualizarPedidoSchema,
  obtenerPedidoPorIdSchema,
  filtrarPedidosPorEstadoSchema
};