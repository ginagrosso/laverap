const orderService = require('../../core/services/order.service');
const db = require('../../config/firebase.config');
const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');

// Crear un nuevo pedido
const createOrder = async (req, res, next) => {
  try {
    const { clienteId, servicioId, detalle, observaciones } = req.body;
    
    // Si es admin y envió clienteId, usar ese; si no, usar el del token
    const clienteFinal = (req.user.rol === 'admin' && clienteId) 
      ? clienteId 
      : req.user.id;

    // Validar que el cliente existe si admin especificó uno diferente
    if (req.user.rol === 'admin' && clienteId) {
      const clienteDoc = await db.collection('clientes').doc(clienteId).get();
      if (!clienteDoc.exists) {
        throw new AppError(
          ERROR_CODES.USER_NOT_FOUND,
          'El cliente especificado no existe',
          404
        );
      }
    }

    const pedidoData = { servicioId, detalle, observaciones };
    const pedidoNuevo = await orderService.createNewOrder(pedidoData, clienteFinal);

    res.status(201).json({
      message: 'Pedido creado exitosamente.',
      data: pedidoNuevo
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los pedidos del usuario logueado
const getMyOrders = async (req, res, next) => {
  try {
    const clienteId = req.user.id;
    const pedidos = await orderService.getOrdersByClientId(clienteId);

    res.status(200).json({
      message: 'Pedidos obtenidos exitosamente.',
      data: pedidos
    });
  } catch (error) {
    next(error);
  }
};

// Obtener TODOS los pedidos con filtros (solo admin)
const getAllOrders = async (req, res, next) => {
  try {
    const filters = {
      estado: req.query.estado,
      clienteId: req.query.clienteId,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await orderService.getAllOrders(filters);

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un pedido específico por ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await orderService.getOrderById(id);

    res.status(200).json({
      message: 'Pedido obtenido exitosamente.',
      data: pedido
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar el estado de un pedido (solo admin/operario)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;
    const pedidoActualizado = await orderService.updateOrderStatus(id, estado, observaciones);

    res.status(200).json({
      message: 'Estado del pedido actualizado exitosamente.',
      data: pedidoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Cancelar un pedido (cliente - solo si está Pendiente)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const pedidoActualizado = await orderService.updateOrderStatus(
      id, 
      'Cancelado', 
      observaciones || 'Cancelado por el cliente',
      'cliente'
    );

    res.status(200).json({
      message: 'Pedido cancelado exitosamente.',
      data: pedidoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar cualquier campo de un pedido (solo admin)
const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const pedidoActualizado = await orderService.updateOrder(id, datosActualizacion);

    res.status(200).json({
      success: true,
      message: 'Pedido actualizado exitosamente.',
      data: pedidoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete de un pedido (solo admin)
const softDeleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await orderService.softDeleteOrder(id);

    res.status(200).json({
      success: true,
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updateOrder,
  softDeleteOrder
};