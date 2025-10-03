const db = require('../../config/firebase.config'); // Importamos la conexión a Firestore
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerNewUser = async (userData) => {
  const { nombre, email, password } = userData;

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

// --- NUEVA FUNCIÓN PARA EL LOGIN ---
const loginUser = async (loginData) => {
    const { email, password } = loginData;
  
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