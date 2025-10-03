const app = require('./app');
const dotenv = require('dotenv');

// Carga las variables de entorno del archivo .env
dotenv.config();

// Lee el puerto desde las variables de entorno, o usa 3000 por defecto
const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});