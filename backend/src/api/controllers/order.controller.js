const orderService = require('../../core/services/order.service');

/**
 * Crear un nuevo pedido
 * Los datos ya vienen validados por el middleware
 */
const createOrder = async (req, res) => {
  try {
    const clienteId = req.user.id;
    const datosPedido = req.body;

    const pedidoNuevo = await orderService.createNewOrder(datosPedido, clienteId);

    res.status(201).json({
      message: 'Pedido creado exitosamente.',
      data: pedidoNuevo
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(400).json({ 
      message: error.message 
    });
  }
};

/**
 * Obtener todos los pedidos del usuario logueado
 */
const getMyOrders = async (req, res) => {
  try {
    const clienteId = req.user.id;
    const pedidos = await orderService.getOrdersByClientId(clienteId);

    res.status(200).json({
      message: 'Pedidos obtenidos exitosamente.',
      data: pedidos
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor.' 
    });
  }
};

/**
 * Obtener TODOS los pedidos (solo admin)
 */
const getAllOrders = async (req, res) => {
  try {
    const todosPedidos = await orderService.getAllOrders();

    res.status(200).json({
      message: 'Todos los pedidos obtenidos exitosamente.',
      data: todosPedidos
    });
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor.' 
    });
  }
};

/**
 * Obtener un pedido específico por ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await orderService.getOrderById(id);

    res.status(200).json({
      message: 'Pedido obtenido exitosamente.',
      data: pedido
    });
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    
    if (error.message === 'Pedido no encontrado.') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor.' 
    });
  }
};

/**
 * Actualizar el estado de un pedido (solo admin/operario)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const pedidoActualizado = await orderService.updateOrderStatus(id, estado, observaciones);

    res.status(200).json({
      message: 'Estado del pedido actualizado exitosamente.',
      data: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    
    if (error.message === 'Pedido no encontrado.') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(400).json({ 
      message: error.message 
    });
  }
};

/**
 * Registrar un pago para un pedido (solo admin/operario)
 */
const registerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const datosPago = req.body;

    const pedidoConPago = await orderService.registerPayment(id, datosPago);

    res.status(200).json({
      message: 'Pago registrado exitosamente.',
      data: pedidoConPago
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    
    if (error.message === 'Pedido no encontrado.') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(400).json({ 
      message: error.message 
    });
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