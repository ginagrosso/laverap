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

// --- FUNCIÓN DE VALIDACIÓN ---
const validateServiceData = (data) => {
    const { nombre, modeloDePrecio } = data;

    if (!nombre || typeof nombre !== 'string') {
        throw new Error('El campo "nombre" es obligatorio y debe ser un texto.');
    }
    if (!modeloDePrecio || typeof modeloDePrecio !== 'string') {
        throw new Error('El campo "modeloDePrecio" es obligatorio y debe ser un texto.');
    }

    switch (modeloDePrecio) {
        case 'porCanasto':
            if (typeof data.precioPorCanasto !== 'number') {
                throw new Error("Para el modelo 'porCanasto', el campo 'precioPorCanasto' es obligatorio y debe ser un número.");
            }
            if (typeof data.itemsPorCanasto !== 'number') {
                throw new Error("Para el modelo 'porCanasto', el campo 'itemsPorCanasto' es obligatorio y debe ser un número.");
            }
            if (typeof data.minimoItems !== 'number') {
                throw new Error("Para el modelo 'porCanasto', el campo 'minimoItems' es obligatorio y debe ser un número.");
            }
            break;
        
        case 'porUnidad':
            if (typeof data.precioBase !== 'number') {
                throw new Error("Para el modelo 'porUnidad', el campo 'precioBase' es obligatorio y debe ser un número.");
            }
            if (typeof data.minimoUnidades !== 'number') {
                throw new Error("Para el modelo 'porUnidad', el campo 'minimoUnidades' es obligatorio y debe ser un número.");
            }
            // El campo 'opcionesDePrecio' es opcional, por lo que no se valida aquí.
            break;

        default:
            throw new Error(`El modelo de precio "${modeloDePrecio}" no es válido.`);
    }
    // Si todo está bien, no hacemos nada
};


const createService = async (serviceData) => {
    // 1. Ejecutamos la validación primero
    validateServiceData(serviceData);
    
    // 2. Si la validación pasa, guardamos en la base de datos
    const serviceRef = await db.collection('servicios').add(serviceData);
    return { id: serviceRef.id, ...serviceData };
};

module.exports = { getAllServices , createService};