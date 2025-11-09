const serviceService = require('../../core/services/service.service');

// Obtiene todos los servicios
const getServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServices();
    
    res.status(200).json({
      message: `Se encontraron ${services.length} servicios.`,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// Crea un nuevo servicio
const createService = async (req, res, next) => {
  try {
    const nuevoServicio = await serviceService.createService(req.body);
    
    res.status(201).json({
      message: 'Servicio creado exitosamente.',
      data: nuevoServicio
    });
  } catch (error) {
    next(error);
  }
};

// Obtiene un servicio por ID
const getServiceById = async (req, res, next) => {
  try {
    const servicio = await serviceService.getServiceById(req.params.id);
    
    res.status(200).json({
      message: 'Servicio obtenido exitosamente.',
      data: servicio
    });
  } catch (error) {
    next(error);
  }
};

// Actualiza un servicio
const updateService = async (req, res, next) => {
  try {
    const servicioActualizado = await serviceService.updateService(
      req.params.id,
      req.body
    );
    
    res.status(200).json({
      message: 'Servicio actualizado exitosamente.',
      data: servicioActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Obtiene todos los servicios incluyendo inactivos (admin only)
const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServicesForAdmin();

    res.status(200).json({
      message: `Se encontraron ${services.length} servicios.`,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// Desactiva un servicio
const deactivateService = async (req, res, next) => {
  try {
    const resultado = await serviceService.deactivateService(req.params.id);

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

// Activa un servicio previamente desactivado
const activateService = async (req, res, next) => {
  try {
    const servicioActivado = await serviceService.activateService(req.params.id);

    res.status(200).json({
      message: 'Servicio activado exitosamente.',
      data: servicioActivado
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getAllServicesAdmin,
  createService,
  getServiceById,
  updateService,
  deactivateService,
  activateService
};