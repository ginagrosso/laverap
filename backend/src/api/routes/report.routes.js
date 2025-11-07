const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { rangoFechasSchema, limiteTopSchema } = require('../../core/schemas/report.schemas');

// Resumen general del dashboard
router.get('/summary', 
  protect, 
  authorize('admin'), 
  reportController.getSummary
);

// Pedidos agrupados por estado
router.get('/orders-by-status', 
  protect, 
  authorize('admin'), 
  validate(rangoFechasSchema, 'query'), 
  reportController.getOrdersByStatus
);

// Ingresos totales y por mes
router.get('/revenue', 
  protect, 
  authorize('admin'), 
  validate(rangoFechasSchema, 'query'), 
  reportController.getRevenue
);

// Servicios más populares
router.get('/popular-services', 
  protect, 
  authorize('admin'), 
  validate(limiteTopSchema, 'query'), 
  reportController.getPopularServices
);

// Estadísticas de clientes
router.get('/clients', 
  protect, 
  authorize('admin'), 
  reportController.getClientsStats
);

module.exports = router;
