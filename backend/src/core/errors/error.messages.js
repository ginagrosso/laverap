const ERROR_CODES = require('./error.codes');

// Mensajes amigables para el usuario
const ERROR_MESSAGES = {
  // Autenticación
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Email o contraseña incorrectos.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'No existe una cuenta con ese email.',
  [ERROR_CODES.AUTH_INVALID_PASSWORD]: 'La contraseña es incorrecta.',
  [ERROR_CODES.AUTH_EMAIL_EXISTS]: 'Ya existe una cuenta con ese email.',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Token de autenticación inválido.',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Debes iniciar sesión para acceder a este recurso.',
  [ERROR_CODES.AUTH_FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  
  // Pedidos
  [ERROR_CODES.ORDER_NOT_FOUND]: 'El pedido solicitado no existe.',
  [ERROR_CODES.ORDER_INVALID_SERVICE]: 'El servicio seleccionado no es válido.',
  [ERROR_CODES.ORDER_INVALID_PRICE_MODEL]: 'Error al calcular el precio del servicio.',
  [ERROR_CODES.ORDER_INVALID_STATE_TRANSITION]: 'No se puede cambiar el pedido a ese estado.',
  [ERROR_CODES.ORDER_ALREADY_PAID]: 'Este pedido ya ha sido pagado.', // Reservado para uso futuro
  [ERROR_CODES.ORDER_CANNOT_PAY]: 'Solo se pueden registrar pagos para pedidos en estado "Finalizado" o "Entregado".', // Reservado para uso futuro
  [ERROR_CODES.ORDER_UNAUTHORIZED_ACCESS]: 'No tienes permiso para ver este pedido.',
  
  // Servicios
  [ERROR_CODES.SERVICE_NOT_FOUND]: 'El servicio solicitado no existe.',
  [ERROR_CODES.SERVICE_INACTIVE]: 'El servicio seleccionado no está disponible actualmente.',
  [ERROR_CODES.SERVICE_INVALID_MODEL]: 'El modelo de precio del servicio no es válido.',
  
  // Usuarios
  [ERROR_CODES.USER_NOT_FOUND]: 'El usuario solicitado no existe.',
  [ERROR_CODES.USER_INACTIVE]: 'Esta cuenta ha sido desactivada.',
  
  // Validación
  [ERROR_CODES.VALIDATION_ERROR]: 'Los datos enviados no son válidos.',
  [ERROR_CODES.VALIDATION_MISSING_FIELD]: 'Falta información requerida.',
  
  // Sistema
  [ERROR_CODES.SYSTEM_DATABASE_ERROR]: 'Error al conectar con la base de datos. Intenta nuevamente.',
  [ERROR_CODES.SYSTEM_UNKNOWN_ERROR]: 'Ocurrió un error inesperado. Por favor, contacta al soporte.'
};

module.exports = ERROR_MESSAGES;