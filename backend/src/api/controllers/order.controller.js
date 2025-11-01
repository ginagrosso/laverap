const orderService = require('../../core/services/order.service');

// Crear un nuevo pedido
const createOrder = async (req, res, next) => {
  try {
    const clienteId = req.user.id;
    const pedidoNuevo = await orderService.createNewOrder(req.body, clienteId);

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

// Obtener TODOS los pedidos (solo admin)
const getAllOrders = async (req, res, next) => {
  try {
    const todosPedidos = await orderService.getAllOrders();

    res.status(200).json({
      message: 'Todos los pedidos obtenidos exitosamente.',
      data: todosPedidos
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

// Registrar un pago para un pedido (solo admin/operario)
const registerPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedidoConPago = await orderService.registerPayment(id, req.body);

    res.status(200).json({
      message: 'Pago registrado exitosamente.',
      data: pedidoConPago
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
  registerPayment      
};