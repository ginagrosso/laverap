const authService = require('../../core/services/auth.service');

const register = async (req, res) => {
  try {
    // 1. Obtenemos los datos del cuerpo de la petición
    const { nombre, email, password } = req.body;

    // 2. Validación básica de entrada
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // 3. Llamamos al servicio para registrar al usuario
    const newUser = await authService.registerNewUser({ nombre, email, password });

    // 4. Enviamos una respuesta exitosa
    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      usuario: newUser
    });

  } catch (error) {
    // 5. Manejo de errores
    res.status(500).json({ message: error.message });
  }
};
// --- NUEVA FUNCIÓN PARA EL LOGIN ---
const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
      }
  
      const result = await authService.loginUser({ email, password });
  
      res.status(200).json({
        message: 'Inicio de sesión exitoso.',
        data: result
      });
  
    } catch (error) {
      // Si el error es por "Credenciales inválidas", enviamos un 401 (No autorizado)
      if (error.message === 'Credenciales inválidas.') {
          return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };

module.exports = {
  register,
  login,
};