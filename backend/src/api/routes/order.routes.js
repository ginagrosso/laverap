const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware'); // Importar authorize
const { chequearPropiedad } = require('../middlewares/propiedad.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { 
  crearPedidoSchema,
  actualizarEstadoPedidoSchema,
  actualizarPedidoSchema,
  obtenerPedidoPorIdSchema
} = require('../../core/schemas/order.schemas');

/**
 * Rutas para gestión de pedidos
 */

// POST /api/v1/orders -> Crear pedido (cualquier usuario autenticado)
router.post(
  '/', 
  protect, 
  validate(crearPedidoSchema, 'body'),
  orderController.createOrder
);

// GET /api/v1/orders -> Obtener mis pedidos (cualquier usuario autenticado)
router.get(
  '/', 
  protect, 
  orderController.getMyOrders
);

// GET /api/v1/orders/all -> Obtener TODOS los pedidos (solo admin)
router.get(
  '/all',
  protect,
  authorize('admin'), // Solo usuarios con rol 'admin'
  orderController.getAllOrders
);

// GET /api/v1/orders/:id -> Obtener un pedido específico (cualquier usuario autenticado)
router.get(
  '/:id',
  protect,
  validate(obtenerPedidoPorIdSchema, 'params'),
  chequearPropiedad('pedidos', 'clienteId'),
  orderController.getOrderById
);

// PATCH /api/v1/orders/:id -> Actualizar cualquier campo (solo admin)
router.patch(
  '/:id',
  protect,
  authorize('admin'),
  validate(obtenerPedidoPorIdSchema, 'params'),
  validate(actualizarPedidoSchema, 'body'),
  orderController.updateOrder
);

// DELETE /api/v1/orders/:id -> Soft delete (solo admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(obtenerPedidoPorIdSchema, 'params'),
  orderController.softDeleteOrder
);

// PATCH /api/v1/orders/:id/cancel -> Cliente cancela su pedido (solo si está Pendiente)
router.patch(
  '/:id/cancel',
  protect,
  validate(obtenerPedidoPorIdSchema, 'params'),
  chequearPropiedad('pedidos', 'clienteId'),
  orderController.cancelOrder
);

// PATCH /api/v1/orders/:id/status -> Actualizar estado (admin u operario)
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'operario'), // Admin u operario pueden cambiar estados
  validate(obtenerPedidoPorIdSchema, 'params'),
  validate(actualizarEstadoPedidoSchema, 'body'),
  orderController.updateOrderStatus
);

module.exports = router;