const db = require('../../config/firebase.config'); // Importamos la conexión a Firestore
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const joi = require('joi');

// Esquemas de validación con Joi
const registerSchema = joi.object({
  nombre: joi.string().min(2).max(50).required(),
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(6).max(128).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} userData - Datos del usuario (nombre, email, password)
 * @returns {Object} - Usuario creado sin contraseña
 */
const registerNewUser = async (userData) => {
  // Validar datos de entrada con Joi
  const { error, value } = registerSchema.validate(userData);
  if (error) {
    throw new Error(`Error de validación: ${error.details[0].message}`);
  }

  const { nombre, email, password } = value;

  // 1. Verificar si el usuario ya existe
  const usersRef = db.collection('clientes'); // Usamos la colección 'clientes' como en tu diagrama
  const snapshot = await usersRef.where('email', '==', email).get();

  if (!snapshot.empty) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // 2. Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Crear el nuevo objeto de usuario
  const newUser = {
    nombre,
    email,
    password: hashedPassword,
    rol: 'cliente', // Asignamos un rol por defecto
    fechaCreacion: new Date()
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
  // Validar datos de entrada con Joi
  const { error, value } = loginSchema.validate(loginData);
  if (error) {
    throw new Error(`Error de validación: ${error.details[0].message}`);
  }

  const { email, password } = value;

  // 1. Buscar al usuario por su correo electrónico
  const usersRef = db.collection('clientes');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    throw new Error('Credenciales inválidas.'); // Error genérico por seguridad
  }

  // 2. Obtener los datos del usuario encontrado
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;

  // 3. Comparar la contraseña enviada con la contraseña hasheada en la BD
  const isPasswordCorrect = await bcrypt.compare(password, userData.password);

  if (!isPasswordCorrect) {
    throw new Error('Credenciales inválidas.'); // Mismo error genérico
  }

  // 4. Si la contraseña es correcta, generar un JWT
  const payload = {
    id: userId,
    email: userData.email,
    rol: userData.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 5. Devolver los datos del usuario y el token
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