const jwt = require('jsonwebtoken');
const db = require('../../config/firebase.config');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userDoc = await db.collection('clientes').doc(decoded.id).get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ message: 'No se encontró el usuario de este token.' });
      }

      const { password, ...userData } = userDoc.data();
      req.user = { id: userDoc.id, ...userData };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no se proporcionó un token.' });
  }
};

// --- NUEVA FUNCIÓN DE AUTORIZACIÓN ---
const authorize = (...roles) => {
  return (req, res, next) => {
    // El middleware 'protect' ya debió haber añadido 'req.user'
    if (!req.user || !roles.includes(req.user.rol)) {
      // Si el rol del usuario no está en la lista de roles permitidos
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    // Si el rol es correcto, pasa a la siguiente función
    next();
  };
};

module.exports = { protect, authorize };