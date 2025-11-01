const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware'); // <-- Importamos nuestro middleware
const { validate } = require('../middlewares/validate.middleware');
const { actualizarPerfilSchema } = require('../../core/schemas/user.schemas');

// GET /api/v1/users/me
// Esta ruta está protegida. Primero se ejecuta el middleware "protect"
// y solo si el token es válido, se ejecutará "userController.getMe"
router.get('/me', protect, userController.getMe);

// PATCH /api/v1/users/me - Actualizar perfil del usuario autenticado
router.patch('/me', 
  protect, 
  validate(actualizarPerfilSchema, 'body'), 
  userController.updateProfile
);

// --- NUEVA RUTA SOLO PARA ADMIN ---
// Ruta para obtener todos los usuarios.
// Primero se ejecuta 'protect' (para verificar el login)
// Luego se ejecuta 'authorize' (para verificar que el rol sea 'admin')
router.get('/', protect, authorize('admin'), userController.getUsers);

module.exports = router;