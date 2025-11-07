const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { 
  actualizarPerfilSchema, 
  usuarioIdParamSchema,
  filtrosUsuariosSchema,
  crearUsuarioSchema,
  cambiarRolSchema 
} = require('../../core/schemas/user.schemas');

// Usuario obtiene su propio perfil
router.get('/me', protect, userController.getMe);

// Usuario actualiza su propio perfil
router.patch('/me', 
  protect, 
  validate(actualizarPerfilSchema, 'body'), 
  userController.updateProfile
);

// Admin lista todos los usuarios con filtros
router.get('/', 
  protect, 
  authorize('admin'), 
  validate(filtrosUsuariosSchema, 'query'),
  userController.getUsers
);

// Admin crea nuevo usuario
router.post('/',
  protect,
  authorize('admin'),
  validate(crearUsuarioSchema, 'body'),
  userController.createUser
);

// Admin obtiene usuario por ID
router.get('/:id', 
  protect, 
  authorize('admin'), 
  validate(usuarioIdParamSchema, 'params'),
  userController.getUserById
);

// Admin cambia rol de usuario
router.patch('/:id/role',
  protect,
  authorize('admin'),
  validate(usuarioIdParamSchema, 'params'),
  validate(cambiarRolSchema, 'body'),
  userController.changeUserRole
);

// Admin desactiva usuario
router.patch('/:id/desactivar',
  protect,
  authorize('admin'),
  validate(usuarioIdParamSchema, 'params'),
  userController.deactivateUser
);

// Admin reactiva usuario
router.patch('/:id/activar',
  protect,
  authorize('admin'),
  validate(usuarioIdParamSchema, 'params'),
  userController.activateUser
);

// Admin elimina usuario permanentemente
router.delete('/:id',
  protect,
  authorize('admin'),
  validate(usuarioIdParamSchema, 'params'),
  userController.deleteUser
);

module.exports = router;