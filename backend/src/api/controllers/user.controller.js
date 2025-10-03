// Este controlador es muy simple, ya que el middleware hizo todo el trabajo pesado
const getMe = async (req, res) => {
    // Gracias al middleware, ya tenemos la información del usuario en "req.user"
    // No necesitamos volver a consultar la base de datos.
    const userProfile = req.user;
  
    res.status(200).json({
      message: 'Perfil obtenido exitosamente.',
      data: userProfile
    });
  };
  
  module.exports = {
    getMe,
  };