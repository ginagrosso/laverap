// Importamos el SDK de Firebase Admin
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Cargamos las variables de entorno para asegurarnos de que estén disponibles
dotenv.config();

// Creamos un objeto con las credenciales, leyendo desde el .env
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza los escapes de nueva línea
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Inicializamos la aplicación de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//Creamos una referencia a la base de datos de Firestore
const db = admin.firestore();

console.log('Firebase conectado correctamente.');

// Exportamos la referencia a la base de datos para usarla en otras partes de la aplicación
module.exports = db;