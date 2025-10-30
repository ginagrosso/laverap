const joi = require('joi');
const { campoFirebaseId, campoObservaciones } = require('./common.schemas');

/**
 * Esquemas de validación para el módulo de pedidos
 */

// Schema para crear un nuevo pedido
const crearPedidoSchema = joi.object({
  servicioId: campoFirebaseId.messages({
    'string.empty': 'El ID del servicio es obligatorio.',
    'string.length': 'El ID del servicio no es válido.'
  }),
  
  detalle: joi.object({
    // Para modelo "paqueteConAdicional"
    paqueteBase: joi.string().optional(),
    adicionales: joi.array().items(joi.string()).optional(),
    
    // Para modelo "porOpcionesMultiples"
    // Permite propiedades dinámicas (categorías como "Tipo", "Tamaño", etc.)
    cantidad: joi.number().integer().min(1).optional(),
    
    // Para modelo "porOpciones"
    opcion: joi.string().optional(),
  })
    .unknown(true) // Permite propiedades adicionales para categorías dinámicas
    .required()
    .messages({
      'object.base': 'El detalle del pedido debe ser un objeto.',
      'any.required': 'El detalle del pedido es obligatorio.'
    }),
  
  observaciones: campoObservaciones
})
  .messages({
    'object.base': 'Los datos del pedido no son válidos.'
  });

// Schema para actualizar el estado de un pedido (solo lavanderos/admin)
const actualizarEstadoPedidoSchema = joi.object({
  estado: joi.string()
    .valid('En Proceso', 'Listo', 'Entregado', 'Cancelado')
    .required()
    .messages({
      'any.only': 'El estado debe ser: En Proceso, Listo, Entregado o Cancelado.',
      'string.empty': 'El estado es un campo obligatorio.'
    }),
  
  observaciones: campoObservaciones
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
    .valid('Recibido', 'En Proceso', 'Listo', 'Entregado', 'Cancelado')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: Recibido, En Proceso, Listo, Entregado o Cancelado.'
    })
});

module.exports = {
  crearPedidoSchema,
  actualizarEstadoPedidoSchema,
  obtenerPedidoPorIdSchema,
  filtrarPedidosPorEstadoSchema
};