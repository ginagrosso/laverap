const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { 
  servicioSchema, 
  obtenerServicioPorIdSchema 
} = require('../../core/schemas/service.schemas');

// Rutas públicas
router.get('/', serviceController.getServices);

// Rutas admin - IMPORTANTE: /all debe ir antes de /:id para evitar conflictos
router.get('/all',
  protect,
  authorize('admin'),
  serviceController.getAllServicesAdmin
);

router.get('/:id',
  validate(obtenerServicioPorIdSchema, 'params'),
  serviceController.getServiceById
);

router.post('/',
  protect,
  authorize('admin'),
  validate(servicioSchema, 'body'),
  serviceController.createService
);

router.put('/:id', 
  protect, 
  authorize('admin'), 
  validate(obtenerServicioPorIdSchema, 'params'),
  validate(servicioSchema, 'body'), 
  serviceController.updateService
);

router.delete('/:id',
  protect,
  authorize('admin'),
  validate(obtenerServicioPorIdSchema, 'params'),
  serviceController.deactivateService
);

router.patch('/:id/activar',
  protect,
  authorize('admin'),
  validate(obtenerServicioPorIdSchema, 'params'),
  serviceController.activateService
);

module.exports = router;