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

module.exports = { getServices };