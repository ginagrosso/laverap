const authService = require('../../core/services/auth.service');

// Controlador para registrar usuarios
const register = async (req, res, next) => {
  try {
    const nuevoUsuario = await authService.registerNewUser(req.body);
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      usuario: nuevoUsuario
    });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

// Controlador para login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const resultado = await authService.loginUser({ email, password });
    
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      data: resultado
    });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

module.exports = {
  register,
  login,
};