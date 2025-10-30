const db = require('../../config/firebase.config'); // Importa la configuración de Firebase/Firestore
const { actualizarPerfilSchema } = require('../schemas/user.schemas');

/**
 * Servicio para gestionar usuarios
 * Contiene la lógica de negocio relacionada con operaciones de usuarios
 */

/**
 * Obtiene todos los usuarios de la base de datos
 * @returns {Promise<Array>} - Lista de usuarios (sin contraseñas)
 */
const getAllUsers = async () => {
    try {
        // Obtiene referencia a la colección 'clientes' en Firestore
        const usersRef = db.collection('clientes');
        
        // Ejecuta la consulta para obtener todos los documentos
        const snapshot = await usersRef.get();
        
        // Si no hay usuarios, retorna array vacío
        if (snapshot.empty) {
            return [];
        }
        
        // Array para almacenar los usuarios procesados
        const users = [];
        
        // Itera sobre cada documento en el snapshot
        snapshot.forEach(doc => {
            // Desestructura para excluir la contraseña del objeto
            const { password, ...userData } = doc.data();
            
            // Agrega el usuario al array con su ID y datos (sin contraseña)
            users.push({ id: doc.id, ...userData });
        });
        
        return users; // Retorna la lista de usuarios
    } catch (error) {
        // Propaga el error con un mensaje más descriptivo
        throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
};

/**
 * Obtiene un usuario específico por su ID
 * @param {string} userId - ID único del usuario en Firebase
 * @returns {Promise<Object>} - Datos del usuario (sin contraseña)
 * @throws {Error} - Si el ID no se proporciona o el usuario no existe
 */
const getUserById = async (userId) => {
    // Validación: Verifica que se proporcionó un ID
    if (!userId) {
        throw new Error('El ID del usuario es obligatorio.');
    }

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
 * @param {Object} updateData - Datos a actualizar (nombre, telefono, direccion)
 * @returns {Promise<Object>} - Usuario actualizado (sin contraseña)
 * @throws {Error} - Si hay errores de validación o el usuario no existe
 */
const updateUserProfile = async (userId, updateData) => {
    // Validación con Joi: Verifica que los datos cumplan con el schema definido
    const { error, value } = actualizarPerfilSchema.validate(updateData, { 
        abortEarly: false  // Retorna todos los errores, no solo el primero
    });
    
    // Si hay errores de validación, los formatea y lanza excepción
    if (error) {
        const mensajes = error.details.map(err => err.message).join(', ');
        throw new Error(`Errores de validación: ${mensajes}`);
    }

    // Validación: Verifica que se proporcionó un ID
    if (!userId) {
        throw new Error('El ID del usuario es obligatorio.');
    }

    // Obtiene referencia al documento del usuario
    const userRef = db.collection('clientes').doc(userId);
    const userDoc = await userRef.get();

    // Verifica que el usuario existe antes de intentar actualizar
    if (!userDoc.exists) {
        throw new Error('Usuario no encontrado.');
    }

    // Prepara los datos a actualizar, agregando fecha de modificación
    const dataToUpdate = {
        ...value,  // Datos validados por Joi
        fechaActualizacion: new Date()  // Timestamp de la actualización
    };

    // Actualiza el documento en Firestore
    await userRef.update(dataToUpdate);

    // Obtiene y retorna el usuario actualizado (sin contraseña)
    return await getUserById(userId);
};

// Exporta todas las funciones del servicio para ser usadas en los controladores
module.exports = {
    getAllUsers,
    getUserById,
    updateUserProfile
};