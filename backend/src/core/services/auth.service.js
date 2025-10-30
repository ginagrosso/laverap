const db = require('../../config/firebase.config'); // Importamos la conexión a Firestore
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const joi = require('joi');

// Esquemas de validación con Joi
const registerSchema = joi.object({
  nombre: joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'El nombre es un campo obligatorio.',
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no puede superar los 50 caracteres.'
  }),
  email: joi.string().trim().email({tlds: { allow: false }}) // Acepta cualquier dominio, no solo .com, .net, etc.
  .lowercase()
  .required()
  .messages({
    'string.empty': 'El correo electrónico es un campo obligatorio.',
    'string.email': 'El correo electrónico debe tener un formato válido.'
  }),
  password: joi.string().min(6).max(128).required(). messages({
    'string.empty': 'La contraseña es un campo obligatorio.',
    'string.min': 'La contraseña debe tener al menos 6 caracteres.',
    'string.max': 'La contraseña no puede superar los 128 caracteres.'
  }),
  rol: joi.string()
    .valid('cliente', 'admin')
    .default('cliente') // ← Valor por defecto
    .messages({
      'any.only': 'El rol debe ser "cliente" o "admin".'
    }),
  fechaCreacion: joi.date()
    .default(() => new Date()) // ← Se ejecuta al validar
});

// Esquema para validar el login

const loginSchema = joi.object({
  email: joi.string().trim().email({tlds: { allow: false }}).lowercase().required().messages({
    'string.empty': 'El correo electrónico es un campo obligatorio.',
    'string.email': 'El correo electrónico debe tener un formato válido.'
  }),
  password: joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria.'
  })
});

// --- FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO ---

const registerNewUser = async (userData) => {
  // Validar datos de entrada con Joi
  const { error, value } = registerSchema.validate(userData,{ abortEarly: false });// Devuelve TODOS los errores, no solo el primero
  
  if (error) {
    //Formateo de errores para mejor legibilidad
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Errores de validación: ${errorMessages.join(', ')}`);
  }

  const { nombre, email, password, rol, fechaCreacion } = value; // Usamos 'value' que ya está validado y sanitizado

  // Normalizar email a minúsculas (por si acaso, aunque Joi ya lo hace)
  const emailNormalizado = email.toLowerCase().trim();

  // 1. Verificar si el usuario ya existe
  const usersRef = db.collection('clientes'); // Usamos la colección 'clientes' como en el diagrama
  const snapshot = await usersRef.where('email', '==', emailNormalizado).get();

  if (!snapshot.empty) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // 2. Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Crear el nuevo objeto de usuario
  const newUser = {
    nombre,
    email: emailNormalizado, // Guardar siempre en minúsculas
    password: hashedPassword,
    rol,
    fechaCreacion,
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
  const { error, value } = loginSchema.validate(loginData, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map(detalle => detalle.message)
    throw new Error(`Errores de validación: ${errorMessages.join(', ')}`);
  }

  const { email, password } = value;

  // Normalizar email a minúsculas (por si acaso, aunque Joi ya lo hace)
  const emailNormalizado = email.toLowerCase().trim();

  // 1. Buscar al usuario por su correo electrónico
  const usersRef = db.collection('clientes');
  const snapshot = await usersRef.where('email', '==', emailNormalizado).get();

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