const db = require('../../config/firebase.config'); // Importamos la conexión a Firestore
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/error.codes');

// --- FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO ---

const registerNewUser = async (userData) => {
  // Los datos ya vienen validados desde el middleware
  const { nombre, email, password, telefono, direccion, rol } = userData;

  // Verificar si el usuario ya existe
  const usersRef = db.collection('clientes');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (!snapshot.empty) {
    throw new AppError(
      ERROR_CODES.AUTH_EMAIL_EXISTS,
      'El email ya está registrado',
      400
    );
  }

  // 2. Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Crear el nuevo objeto de usuario
  const newUser = {
    nombre,
    email, // Joi ya normalizó a minúsculas en el middleware
    password: hashedPassword,
    rol: rol || 'cliente', // Default a 'cliente'
    fechaCreacion: new Date(),
    ...(telefono && { telefono }), // Solo agregar si existe
    ...(direccion && { direccion }) // Solo agregar si existe
  };

  // 4. Guardar el usuario en Firestore
  const userDoc = await usersRef.add(newUser);

  // 5. Devolver el usuario creado (sin la contraseña)
  return {
    id: userDoc.id,
    nombre: newUser.nombre,
    email: newUser.email,
    rol: newUser.rol
  };
};

// --- FUNCIÓN PARA EL LOGIN ---
const loginUser = async (loginData) => {
  // Los datos ya vienen validados desde el middleware
  const { email, password } = loginData;

  // Buscar al usuario por su correo electrónico
  const usersRef = db.collection('clientes');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    throw new AppError(
      ERROR_CODES.AUTH_USER_NOT_FOUND,
      'Usuario no encontrado',
      404
    );
  }

  // Obtener los datos del usuario encontrado
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;

  // Comparar la contraseña enviada con la contraseña hasheada en la BD
  const isPasswordCorrect = await bcrypt.compare(password, userData.password);

  if (!isPasswordCorrect) {
    throw new AppError(
      ERROR_CODES.AUTH_INVALID_PASSWORD,
      'Contraseña incorrecta',
      401
    );
  }

  // Si la contraseña es correcta, generar un JWT
  const payload = {
    id: userId,
    email: userData.email,
    rol: userData.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Devolver los datos del usuario y el token
  return {
    usuario: {
      id: userId,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol
    },
    token: token
  };
};

module.exports = {
  registerNewUser,
  loginUser,
};