const orderService = require('../../core/services/order.service');

const createOrder = async (req, res) => {
  try {
    // El ID del cliente lo obtenemos del token JWT, gracias al middleware "protect"
    const clienteId = req.user.id;
    const orderData = req.body;

    // Validación básica
    if (!orderData.servicioId || !orderData.detalle) {
      return res.status(400).json({ message: 'El ID del servicio y el detalle son obligatorios.' });
    }

    const newOrder = await orderService.createNewOrder(orderData, clienteId);

    res.status(201).json({
      message: 'Pedido creado exitosamente. Este es un precio estimado y será confirmado en el local.',
      data: newOrder
    });

  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
    try {
        const clienteId = req.user.id;
        const orders = await orderService.getOrdersByClientId(clienteId);
        res.status(200).json({
            message: `Se encontraron ${orders.length} pedidos.`,
            data: orders
        });
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
  createOrder,
  getMyOrders,
};