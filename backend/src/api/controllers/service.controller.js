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
        const serviceData = req.body;
        
        const newService = await serviceService.createService(serviceData);
        
        res.status(201).json({
            message: 'Servicio creado exitosamente.',
            data: newService,
        });
    } catch (error) {
        // Si el error viene de nuestras validaciones, es un error del cliente (400)
        // Si es otro tipo de error, será un error del servidor (500)
        console.error("Error al crear servicio:", error.message);
        res.status(400).json({ message: error.message });
    }
};


module.exports = { getServices , createService };