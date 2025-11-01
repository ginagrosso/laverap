const jwt = require('jsonwebtoken');
const db = require('../../config/firebase.config');
const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');

// Verifica que el usuario esté autenticado
const protect = async (req, res, next) => {
  try {
    let token;

    // Extrae el token del header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Token no proporcionado',
        401
      );
    }

    // Verifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Busca el usuario en la base de datos
    const userDoc = await db.collection('clientes').doc(decoded.id).get();
    
    if (!userDoc.exists) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        'Usuario no encontrado',
        404
      );
    }

    // Carga los datos del usuario en req.user (sin password)
    const { password, ...userData } = userDoc.data();
    req.user = { 
      id: userDoc.id, 
      ...userData 
    };

    next();
  } catch (error) {
    // Los errores de JWT son manejados por el error-handler
    next(error);
  }
};

// Verifica que el usuario tenga uno de los roles permitidos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new AppError(
        ERROR_CODES.AUTH_FORBIDDEN,
        'No tienes permisos para esta acción',
        403
      ));
    }
    next();
  };
};

module.exports = { protect, authorize };