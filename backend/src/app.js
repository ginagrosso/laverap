
// Usamos require, el sistema de módulos clásico de Node.js
const express = require('express');
const cors = require('cors');
require('./config/firebase.config.js');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const serviceRoutes = require('./api/routes/service.routes');
const orderRoutes = require('./api/routes/order.routes');
const reportRoutes = require('./api/routes/report.routes');
const errorHandler = require('./api/middlewares/error.handle.middleware');

// Se crea la instancia de la aplicación Express
const app = express();

// Whitelist de orígenes permitidos
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

// Configuración CORS segura
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, cURL, mobile apps)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS bloqueado: ${origin}`);
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));

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