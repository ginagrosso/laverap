const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// Ambas rutas están protegidas. Solo usuarios logueados pueden acceder.
// POST /api/v1/orders -> Crear un nuevo pedido
router.post('/', protect, orderController.createOrder);

// GET /api/v1/orders -> Obtener todos los pedidos del usuario logueado
router.get('/', protect, orderController.getMyOrders);

module.exports = router;