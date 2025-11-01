const db = require('../../config/firebase.config');
const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');

/**
 * Middleware que verifica la propiedad de un recurso
 * @param {string} coleccion - Nombre de la colección de Firestore ('pedidos')
 * @param {string} campoUsuario - Campo que identifica al dueño ('clienteId')
 * @returns {Function} Middleware de Express
 */
const chequearPropiedad = (coleccion, campoUsuario) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuarioActual = req.user; // Cargado por el middleware protect

      // Admin tiene acceso total
      if (usuarioActual.role === 'admin') {
        return next();
      }

      // Busca el recurso en la colección especificada
      const documentoRef = db.collection(coleccion).doc(id);
      const documento = await documentoRef.get();

      // Verifica que el recurso exista
      if (!documento.exists) {
        throw new AppError(
          ERROR_CODES.ORDER_NOT_FOUND,
          'El recurso solicitado no existe',
          404
        );
      }

      const datosDocumento = documento.data();

      // Verifica que el usuario sea el dueño del recurso
      if (datosDocumento[campoUsuario] !== usuarioActual.id) {
        throw new AppError(
          ERROR_CODES.ORDER_UNAUTHORIZED_ACCESS,
          'No tienes permiso para acceder a este recurso',
          403
        );
      }

      // Usuario es el dueño, continúa
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { chequearPropiedad };