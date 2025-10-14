const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// GET /api/v1/servicios -> Devuelve la lista de todos los servicios
// Esta ruta es pública, no necesita el middleware "protect"
router.get('/', serviceController.getServices);

// --- NUEVA RUTA PROTEGIDA PARA ADMINS ---
// POST /api/v1/servicios -> Crear un nuevo servicio
router.post('/', protect, authorize('admin'), serviceController.createService);

module.exports = router;