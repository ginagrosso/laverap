const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware'); // <-- Importamos nuestro middleware

// GET /api/v1/users/me
// Esta ruta está protegida. Primero se ejecuta el middleware "protect"
// y solo si el token es válido, se ejecutará "userController.getMe"
router.get('/me', protect, userController.getMe);

module.exports = router;