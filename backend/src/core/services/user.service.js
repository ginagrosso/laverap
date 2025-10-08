const db = require('../../config/firebase.config');

// Función para obtener todos los usuarios (típicamente para un admin)
const getAllUsers = async () => {
    const usersRef = db.collection('clientes');
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
        return [];
    }
    const users = [];
    snapshot.forEach(doc => {
        const { password, ...userData } = doc.data();
        users.push({ id: doc.id, ...userData });
    });
    return users;
};

module.exports = { getAllUsers };