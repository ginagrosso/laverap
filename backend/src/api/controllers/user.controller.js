// Este controlador es muy simple, ya que el middleware hizo todo el trabajo pesado
const userService = require('../../core/services/user.service');

const getMe = async (req, res) => {
    // Gracias al middleware, ya tenemos la información del usuario en "req.user"
    // No necesitamos volver a consultar la base de datos.
    const userProfile = req.user;
  
    res.status(200).json({
      message: 'Perfil obtenido exitosamente.',
      data: userProfile
    });
  };

  // --- NUEVA FUNCIÓN PARA ADMIN ---
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
};

  
  module.exports = {
    getMe,
    getUsers,
  };