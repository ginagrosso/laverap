const db = require('../../config/firebase.config'); // Importa la configuración de Firebase/Firestore
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
        throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
};

// Exporta solo la función para obtener usuarios
module.exports = { getAllUsers };