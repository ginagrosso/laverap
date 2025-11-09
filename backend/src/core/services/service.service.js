const db = require('../../config/firebase.config');
const admin = require('firebase-admin');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/error.codes');

const getAllServices = async () => {
    const servicesRef = db.collection('servicios');
    // Filter only active services for public endpoint
    const snapshot = await servicesRef.where('activo', '==', true).get();

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

// Obtiene todos los servicios (incluyendo inactivos) para admin
const getAllServicesForAdmin = async () => {
    const servicesRef = db.collection('servicios');
    // Return ALL services without filtering for admin
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

// Desactiva un servicio (soft delete)
const deactivateService = async (servicioId) => {
  // Verifica que el servicio exista
  const servicio = await getServiceById(servicioId);

  // Verifica si ya está inactivo
  if (servicio.activo === false) {
    throw new AppError(
      ERROR_CODES.SERVICE_ALREADY_INACTIVE,
      'Este servicio ya está desactivado',
      400
    );
  }

  // Marca como inactivo y guarda fecha
  await db.collection('servicios').doc(servicioId).update({
    activo: false,
    fechaDesactivacion: new Date().toISOString()
  });

  return { message: 'Servicio desactivado exitosamente.' };
};

// Activa un servicio previamente desactivado
const activateService = async (servicioId) => {
  // Verifica que el servicio exista
  const servicio = await getServiceById(servicioId);

  // Verifica si ya está activo
  const isActive = servicio.activo !== undefined ? servicio.activo : true;
  if (isActive) {
    throw new AppError(
      ERROR_CODES.SERVICE_ALREADY_ACTIVE,
      'Este servicio ya está activo',
      400
    );
  }

  // Marca como activo y elimina fecha de desactivación
  await db.collection('servicios').doc(servicioId).update({
    activo: true,
    fechaDesactivacion: admin.firestore.FieldValue.delete()
  });

  return await getServiceById(servicioId);
};

module.exports = {
  getAllServices,
  getAllServicesForAdmin,
  createService,
  getServiceById,
  updateService,
  deactivateService,
  activateService
};