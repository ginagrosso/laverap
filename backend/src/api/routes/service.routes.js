const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');

// GET /api/v1/servicios -> Devuelve la lista de todos los servicios
// Esta ruta es pública, no necesita el middleware "protect"
router.get('/', serviceController.getServices);

module.exports = router;