const db = require('../../config/firebase.config');

const getAllServices = async () => {
    const servicesRef = db.collection('servicios');
    const snapshot = await servicesRef.get();

    if (snapshot.empty) {
        return [];
    }

    const services = [];
    snapshot.forEach(doc => {
        services.push({ id: doc.id, ...doc.data() });
    });

    return services;
};

module.exports = { getAllServices };