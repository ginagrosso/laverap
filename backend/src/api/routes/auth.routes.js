const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { registroSchema, loginSchema } = require('../../core/schemas/auth.schemas');

// Definimos la ruta para el registro de usuarios
// POST /api/v1/auth/register
router.post('/register', 
  validate(registroSchema, 'body'), 
  authController.register
);

// POST /api/v1/auth/login
router.post('/login', 
  validate(loginSchema, 'body'), 
  authController.login
);

module.exports = router;