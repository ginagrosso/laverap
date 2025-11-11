const db = require('../../config/firebase.config');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/error.codes');

// Genera password temporal aleatoria de 8 caracteres alfanuméricos
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Obtiene todos los usuarios con filtros opcionales
const getAllUsers = async (filters = {}) => {
  try {
    const { rol, activo, search, page = 1, limit = 20 } = filters;
    
    let usersRef = db.collection('clientes');
    
    // Filtro por rol
    if (rol) {
      usersRef = usersRef.where('rol', '==', rol);
    }
    
    // Nota: No filtramos por 'activo' en Firestore para retrocompatibilidad
    // Usuarios sin campo 'activo' se consideran activos por defecto
    
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }
    
    let users = [];
    
    snapshot.forEach(doc => {
      const { password, ...userData } = doc.data();
      // Asignar activo=true si el campo no existe (retrocompatibilidad)
      const userWithDefaults = {
        id: doc.id,
        ...userData,
        activo: userData.activo !== undefined ? userData.activo : true
      };
      users.push(userWithDefaults);
    });
    
    // Filtro por activo en memoria (después de asignar defaults)
    if (activo !== undefined) {
      users = users.filter(user => user.activo === activo);
    }
    
    // Filtro por búsqueda en nombre o email (case-insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.nombre?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginación
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    };
  } catch (error) {
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
};

// Obtiene un usuario específico por su ID
const getUserById = async (userId) => {
  // Obtiene referencia al documento específico del usuario
    const userRef = db.collection('clientes').doc(userId);
    
    // Ejecuta la consulta para obtener el documento
    const userDoc = await userRef.get();

    // Verifica si el documento existe en Firestore
    if (!userDoc.exists) {
        throw new Error('Usuario no encontrado.');
    }

    // Desestructura para excluir la contraseña del objeto de datos
    const { password, ...userData } = userDoc.data();
    
    // Retorna el usuario con su ID y datos (sin contraseña)
    return { id: userDoc.id, ...userData };
};

/**
 * Actualiza el perfil de un usuario existente
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} updateData - Datos a actualizar (nombre, telefono, direccion) ya validados
 * @returns {Promise<Object>} - Usuario actualizado (sin contraseña)
 * @throws {Error} - Si el usuario no existe
 */
// Usuario actualiza su propio perfil
const updateUserProfile = async (userId, updateData) => {
    const userRef = db.collection('clientes').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new Error('Usuario no encontrado.');
    }

    const dataToUpdate = {
        ...updateData,
        fechaActualizacion: new Date()
    };

    await userRef.update(dataToUpdate);

    return await getUserById(userId);
};

// Admin crea nuevo usuario con password temporal
const createUser = async (userData) => {
  const { nombre, email, telefono, direccion, rol } = userData;
  
  // Verificar si el email ya existe
  const existingUser = await db.collection('clientes').where('email', '==', email.toLowerCase()).get();
  if (!existingUser.empty) {
    throw new AppError(
      ERROR_CODES.USER_EMAIL_EXISTS,
      'Ya existe un usuario con ese email.',
      400
    );
  }
  
  // Generar password temporal
  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  // Crear usuario
  const newUser = {
    nombre,
    email: email.toLowerCase(),
    password: hashedPassword,
    rol: rol || 'cliente',
    activo: true,
    passwordTemporal: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    ...(telefono && { telefono }),
    ...(direccion && { direccion })
  };
  
  const userDoc = await db.collection('clientes').add(newUser);
  
  // Retornar usuario con password sin hashear (solo esta vez)
  const { password, ...userDataWithoutPassword } = newUser;
  
  return {
    id: userDoc.id,
    ...userDataWithoutPassword,
    passwordGenerada: temporaryPassword
  };
};

// Admin cambia rol de usuario
const changeUserRole = async (userId, newRole) => {
  const userRef = db.collection('clientes').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new AppError(
      ERROR_CODES.USER_NOT_FOUND,
      'El usuario solicitado no existe.',
      404
    );
  }
  
  const currentUser = userDoc.data();
  
  // Si está cambiando de admin a cliente, validar que no sea el último admin
  if (currentUser.rol === 'admin' && newRole === 'cliente') {
    const adminsSnapshot = await db.collection('clientes')
      .where('rol', '==', 'admin')
      .where('activo', '==', true)
      .get();
    
    // Contar admins activos (considerando usuarios sin campo activo como activos)
    let activeAdminsCount = 0;
    adminsSnapshot.forEach(doc => {
      const data = doc.data();
      const isActive = data.activo !== undefined ? data.activo : true;
      if (isActive) activeAdminsCount++;
    });
    
    if (activeAdminsCount <= 1) {
      throw new AppError(
        ERROR_CODES.USER_CANNOT_DEMOTE_LAST_ADMIN,
        'No puedes cambiar el rol del último administrador.',
        400
      );
    }
  }
  
  // Actualizar rol
  await userRef.update({
    rol: newRole,
    fechaActualizacion: new Date()
  });
  
  return await getUserById(userId);
};

// Admin desactiva usuario
const deactivateUser = async (userId, adminId) => {
  // Validar que no se desactive a sí mismo
  if (userId === adminId) {
    throw new AppError(
      ERROR_CODES.USER_CANNOT_DEACTIVATE_SELF,
      'No puedes desactivar tu propia cuenta.',
      400
    );
  }
  
  const userRef = db.collection('clientes').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new AppError(
      ERROR_CODES.USER_NOT_FOUND,
      'El usuario solicitado no existe.',
      404
    );
  }
  
  const userData = userDoc.data();
  const isActive = userData.activo !== undefined ? userData.activo : true;
  
  if (!isActive) {
    throw new AppError(
      ERROR_CODES.USER_ALREADY_INACTIVE,
      'Este usuario ya está inactivo.',
      400
    );
  }
  
  // Desactivar usuario
  await userRef.update({
    activo: false,
    fechaDesactivacion: new Date(),
    fechaActualizacion: new Date()
  });
  
  return await getUserById(userId);
};

// Admin reactiva usuario
const activateUser = async (userId) => {
  const userRef = db.collection('clientes').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new AppError(
      ERROR_CODES.USER_NOT_FOUND,
      'El usuario solicitado no existe.',
      404
    );
  }
  
  const userData = userDoc.data();
  const isActive = userData.activo !== undefined ? userData.activo : true;
  
  if (isActive) {
    throw new AppError(
      ERROR_CODES.USER_ALREADY_ACTIVE,
      'Este usuario ya está activo.',
      400
    );
  }
  
  // Reactivar usuario (eliminar campo fechaDesactivacion)
  await userRef.update({
    activo: true,
    fechaDesactivacion: admin.firestore.FieldValue.delete(),
    fechaActualizacion: new Date()
  });
  
  return await getUserById(userId);
};

// Admin elimina usuario permanentemente
const deleteUser = async (userId) => {
  const userRef = db.collection('clientes').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new AppError(
      ERROR_CODES.USER_NOT_FOUND,
      'El usuario solicitado no existe.',
      404
    );
  }
  
  // Validar que no tenga pedidos activos
  const ordersSnapshot = await db.collection('pedidos')
    .where('clienteId', '==', userId)
    .where('activo', '==', true)
    .get();
  
  if (!ordersSnapshot.empty) {
    // Verificar si tiene pedidos en estados activos
    let hasActiveOrders = false;
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (['Pendiente', 'En Proceso', 'Finalizado'].includes(order.estado)) {
        hasActiveOrders = true;
      }
    });
    
    if (hasActiveOrders) {
      throw new AppError(
        ERROR_CODES.USER_HAS_ACTIVE_ORDERS,
        'No se puede eliminar un usuario con pedidos activos.',
        400
      );
    }
  }
  
  // Eliminar usuario permanentemente
  await userRef.delete();
  
  return { id: userId, deleted: true };
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserProfile,
    createUser,
    changeUserRole,
    deactivateUser,
    activateUser,
    deleteUser
};