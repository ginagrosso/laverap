// Importamos el SDK de Firebase Admin
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Cargamos las variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
}

// Singleton pattern: evitar múltiples inicializaciones
if (!admin.apps.length) {
  // Crear objeto con las credenciales
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Inicializar Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase conectado correctamente.');
} else {
  console.log('Firebase ya estaba inicializado (reutilizando instancia).');
}

// Referencia a Firestore
const db = admin.firestore();

// Exportar la referencia
module.exports = db;