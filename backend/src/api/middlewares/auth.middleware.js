const jwt = require('jsonwebtoken');
const database = require('../../config/firebase.config');

const protect = async (req, res, next) => {
  let token;

  // 1. Verificar si el token viene en los headers y tiene el formato correcto
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraer el token del header "Authorization: Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar y decodificar el token usando el secreto
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Buscar el usuario en la base de datos con el ID del token
      //    y adjuntarlo a la petición (req) para que las siguientes funciones lo puedan usar.
      //    Nos aseguramos de no incluir la contraseña.
      const userDoc = await database.collection('clientes').doc(decoded.id).get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ message: 'No se encontró el usuario de este token.' });
      }

      // Adjuntamos el usuario sin la contraseña al objeto req
      const { password, ...userData } = userDoc.data();
      req.user = { id: userDoc.id, ...userData };

      // 5. Si todo está bien, pasamos a la siguiente función (el controlador)
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

module.exports = { protect };