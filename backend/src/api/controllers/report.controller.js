const reportService = require('../../core/services/report.service');

// GET /reports/summary
async function getSummary(req, res, next) {
  try {
    const resumen = await reportService.getSummary();
    res.status(200).json({
      mensaje: 'Resumen obtenido correctamente.',
      resumen
    });
  } catch (error) {
    next(error);
  }
}

// GET /reports/orders-by-status
async function getOrdersByStatus(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const resultado = await reportService.getOrdersByStatus(desde, hasta);
    res.status(200).json({
      mensaje: 'Pedidos por estado obtenidos correctamente.',
      resultado
    });
  } catch (error) {
    next(error);
  }
}

// GET /reports/revenue
async function getRevenue(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const resultado = await reportService.getRevenue(desde, hasta);
    res.status(200).json({
      mensaje: 'Ingresos obtenidos correctamente.',
      resultado
    });
  } catch (error) {
    next(error);
  }
}

// GET /reports/popular-services
async function getPopularServices(req, res, next) {
  try {
    const { limite } = req.query;
    const resultado = await reportService.getPopularServices(limite);
    res.status(200).json({
      mensaje: 'Servicios populares obtenidos correctamente.',
      resultado
    });
  } catch (error) {
    next(error);
  }
}

// GET /reports/clients
async function getClientsStats(req, res, next) {
  try {
    const resultado = await reportService.getClientsStats();
    res.status(200).json({
      mensaje: 'Estadísticas de clientes obtenidas correctamente.',
      resultado
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
  getOrdersByStatus,
  getRevenue,
  getPopularServices,
  getClientsStats
};
