const db = require('../../config/firebase.config');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/error.codes');

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

// Crea un nuevo servicio
const createService = async (datosServicio) => {
  // Agrega el servicio a Firestore
  const nuevoServicioRef = await db.collection('servicios').add({
    ...datosServicio,
    activo: datosServicio.activo !== undefined ? datosServicio.activo : true,
    fechaCreacion: new Date().toISOString()
  });

  // Obtiene el servicio recién creado
  const servicioCreado = await nuevoServicioRef.get();
  
  return {
    id: servicioCreado.id,
    ...servicioCreado.data()
  };
};

// Busca un servicio por ID
const getServiceById = async (servicioId) => {
  const doc = await db.collection('servicios').doc(servicioId).get();
  
  if (!doc.exists) {
    throw new AppError(
      ERROR_CODES.SERVICE_NOT_FOUND,
      'El servicio solicitado no existe',
      404
    );
  }
  
  return { id: doc.id, ...doc.data() };
};

// Actualiza un servicio existente
const updateService = async (servicioId, datosActualizados) => {
  // Verifica que el servicio exista
  await getServiceById(servicioId);
  
  // Actualiza el servicio
  await db.collection('servicios').doc(servicioId).update(datosActualizados);
  
  // Devuelve el servicio actualizado
  const servicioActualizado = await getServiceById(servicioId);
  return servicioActualizado;
};

// Desactiva un servicio (soft delete)
const deactivateService = async (servicioId) => {
  // Verifica que el servicio exista
  await getServiceById(servicioId);
  
  // Marca como inactivo y guarda fecha
  await db.collection('servicios').doc(servicioId).update({
    activo: false,
    fechaDesactivacion: new Date().toISOString()
  });
  
  return { message: 'Servicio desactivado exitosamente.' };
};

module.exports = {
  getAllServices,
  createService,
  getServiceById,
  updateService,
  deactivateService
};