
// Usamos require, el sistema de módulos clásico de Node.js
const express = require('express');
require('./config/firebase.config.js');

const authRoutes = require('./api/routes/auth.routes');// Importamos la configuración de Firebase
const userRoutes = require('./api/routes/user.routes');

// Se crea la instancia de la aplicación Express
const app = express();

// Middleware para que Express pueda entender JSON
app.use(express.json());

// Importamos las rutas de autenticación
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);


// Exportamos la app para que server.js pueda usarla
module.exports = app;