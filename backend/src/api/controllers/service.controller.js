const serviceService = require('../../core/services/service.service');

const getServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json({
            message: `Se encontraron ${services.length} servicios.`,
            data: services
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los servicios.' });
    }
};

// --- NUEVA FUNCIÓN PARA CREAR SERVICIOS ---

const createService = async (req, res) => {
  try {
    // Crea el servicio (validación ya hecha por Joi)
    const nuevoServicio = await serviceService.createService(req.body);
    
    res.status(201).json({
      message: 'Servicio creado exitosamente.',
      data: nuevoServicio
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear el servicio.',
      error: error.message 
    });
  }
};

// Obtiene un servicio por ID
const getServiceById = async (req, res) => {
  try {
    const servicio = await serviceService.getServiceById(req.params.id);
    
    res.status(200).json({
      message: 'Servicio obtenido exitosamente.',
      data: servicio
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error.message 
    });
  }
};

// Actualiza un servicio
const updateService = async (req, res) => {
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
    const statusCode = error.message.includes('no existe') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error.message 
    });
  }
};

// Desactiva un servicio
const deactivateService = async (req, res) => {
  try {
    const resultado = await serviceService.deactivateService(req.params.id);
    
    res.status(200).json(resultado);
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error.message 
    });
  }
};

module.exports = {
  getServices,
  createService,
  getServiceById,      
  updateService,       
  deactivateService    
};