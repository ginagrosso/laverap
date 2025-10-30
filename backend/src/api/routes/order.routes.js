const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware'); // Importar authorize
const { validate } = require('../middlewares/validate.middleware');
const { 
  crearPedidoSchema,
  actualizarEstadoPedidoSchema,
  obtenerPedidoPorIdSchema
} = require('../../core/schemas/order.schemas');
const { registrarPagoSchema } = require('../../core/schemas/payment.schemas');

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
  orderController.getOrderById
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

// POST /api/v1/orders/:id/payment -> Registrar pago (admin u operario)
router.post(
  '/:id/payment',
  protect,
  authorize('admin'), // Admin pueden registrar pagos
  validate(obtenerPedidoPorIdSchema, 'params'),
  validate(registrarPagoSchema, 'body'),
  orderController.registerPayment
);

module.exports = router;