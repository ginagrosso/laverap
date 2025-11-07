
// Usamos require, el sistema de módulos clásico de Node.js
const express = require('express');
require('./config/firebase.config.js');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const serviceRoutes = require('./api/routes/service.routes');
const orderRoutes = require('./api/routes/order.routes');
const reportRoutes = require('./api/routes/report.routes');
const errorHandler = require('./api/middlewares/error.handle.middleware');

// Se crea la instancia de la aplicación Express
const app = express();

// Middleware para que Express pueda entender JSON
app.use(express.json());

// Importamos las rutas de autenticación
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/servicios', serviceRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reports', reportRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  const AppError = require('./core/errors/AppError');
  const ERROR_CODES = require('./core/errors/error.codes');
  
  next(new AppError(
    ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
    `No se encontró la ruta: ${req.originalUrl}`,
    404
  ));
});

// Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

// Exportamos la app para que server.js pueda usarla
module.exports = app;