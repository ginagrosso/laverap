const db = require('../../config/firebase.config');
const { calcularPrecio } = require('./helpers/price-calculator');
const { validarTransicionEstado } = require('./helpers/order.validator');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/error.codes');

/**
 * Servicio para gestionar pedidos
 */

// ==========================================
// FUNCIONES PÚBLICAS DEL SERVICIO
// ==========================================

/**
 * Crea un nuevo pedido en Firestore
 * Los datos ya vienen validados desde el middleware
 */
const createNewOrder = async (orderData, clienteId) => {
  const { servicioId, detalle, observaciones = null } = orderData;

  // Verificar que el servicio existe
  const serviceRef = db.collection('servicios').doc(servicioId);
  const serviceDoc = await serviceRef.get();
  
  if (!serviceDoc.exists) {
    throw new AppError(
      ERROR_CODES.SERVICE_NOT_FOUND,
      'El servicio seleccionado no existe',
      404
    );
  }

  const serviceData = serviceDoc.data();
  
  // Verificar que el servicio esté activo
  if (serviceData.activo === false) {
    throw new AppError(
      ERROR_CODES.SERVICE_INACTIVE,
      'El servicio no está disponible',
      400
    );
  }

  // Calcular precio usando el helper
  const precioEstimado = calcularPrecio(serviceData, detalle);

  if (!precioEstimado) {
    throw new AppError(
      ERROR_CODES.ORDER_INVALID_PRICE_MODEL,
      'Error al calcular el precio',
      500
    );
  }

  // Crear el pedido en Firestore
  const newOrder = {
    clienteId,
    servicio: { 
      id: serviceDoc.id, 
      nombre: serviceData.nombre 
    },
    detalle,
    observaciones,
    precioEstimado,
    estado: 'Pendiente',
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  };

  const orderRef = await db.collection('pedidos').add(newOrder);
  
  return { 
    id: orderRef.id, 
    ...newOrder 
  };
};

/**
 * Obtiene todos los pedidos de un cliente específico
 */
const getOrdersByClientId = async (clienteId) => {
  const ordersRef = db.collection('pedidos');
  
  const snapshot = await ordersRef
    .where('clienteId', '==', clienteId)
    .where('activo', '==', true)
    .get();
  
  if (snapshot.empty) {
    return [];
  }

  const pedidos = [];
  snapshot.forEach(documento => {
    pedidos.push({ 
      id: documento.id, 
      ...documento.data() 
    });
  });

  // Ordenar en memoria por fechaCreacion descendente
  return pedidos.sort((pedidoA, pedidoB) => {
    const fechaA = pedidoA.fechaCreacion?.toDate ? pedidoA.fechaCreacion.toDate() : new Date(pedidoA.fechaCreacion);
    const fechaB = pedidoB.fechaCreacion?.toDate ? pedidoB.fechaCreacion.toDate() : new Date(pedidoB.fechaCreacion);
    return fechaB - fechaA;
  });
};

/**
 * Obtiene TODOS los pedidos (solo para admin)
 * No filtra por cliente
 */
const getAllOrders = async () => {
  const ordersRef = db.collection('pedidos');
  const snapshot = await ordersRef
    .where('activo', '==', true)
    .get();
  
  if (snapshot.empty) {
    return [];
  }

  const todosPedidos = [];
  snapshot.forEach(documento => {
    todosPedidos.push({ 
      id: documento.id, 
      ...documento.data() 
    });
  });

  // Ordenar por fecha de creación descendente
  return todosPedidos.sort((pedidoA, pedidoB) => {
    const fechaA = pedidoA.fechaCreacion?.toDate ? pedidoA.fechaCreacion.toDate() : new Date(pedidoA.fechaCreacion);
    const fechaB = pedidoB.fechaCreacion?.toDate ? pedidoB.fechaCreacion.toDate() : new Date(pedidoB.fechaCreacion);
    return fechaB - fechaA;
  });
};

/**
 * Obtiene un pedido específico por su ID
 */
const getOrderById = async (pedidoId) => {
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoDoc = await pedidoRef.get();

  if (!pedidoDoc.exists) {
    throw new AppError(
      ERROR_CODES.ORDER_NOT_FOUND,
      'Pedido no encontrado',
      404
    );
  }

  return { 
    id: pedidoDoc.id, 
    ...pedidoDoc.data() 
  };
};

/**
 * Actualiza el estado de un pedido
 * Valida que la transición de estado sea válida según el rol
 */
const updateOrderStatus = async (pedidoId, nuevoEstado, observaciones = null, rolUsuario = 'admin') => {
  // Obtener el pedido actual
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoDoc = await pedidoRef.get();
  
  if (!pedidoDoc.exists) {
    throw new AppError(
      ERROR_CODES.ORDER_NOT_FOUND,
      'Pedido no encontrado',
      404
    );
  }

  const pedidoActual = pedidoDoc.data();
  const estadoActual = pedidoActual.estado;

  // Validar que la transición de estado sea válida según el rol
  validarTransicionEstado(estadoActual, nuevoEstado, rolUsuario);

  // Actualizar el estado en Firestore
  const datosActualizacion = {
    estado: nuevoEstado,
    fechaActualizacion: new Date()
  };

  // Si hay observaciones, agregarlas
  if (observaciones) {
    datosActualizacion.observaciones = observaciones;
  }

  await pedidoRef.update(datosActualizacion);

  return { 
    id: pedidoId, 
    ...pedidoActual, 
    ...datosActualizacion 
  };
};

// Actualizar cualquier campo de un pedido
const updateOrder = async (pedidoId, datosActualizacion) => {
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoDoc = await pedidoRef.get();

  if (!pedidoDoc.exists) {
    throw new AppError(
      ERROR_CODES.ORDER_NOT_FOUND,
      'Pedido no encontrado',
      404
    );
  }

  const pedidoActual = pedidoDoc.data();
  const actualizacion = {
    ...datosActualizacion,
    fechaActualizacion: new Date()
  };

  // Si cambia servicio y detalle, recalcular precio
  if (datosActualizacion.servicioId && datosActualizacion.detalle) {
    const serviceDoc = await db.collection('servicios').doc(datosActualizacion.servicioId).get();
    if (!serviceDoc.exists) {
      throw new AppError(
        ERROR_CODES.SERVICE_NOT_FOUND,
        'Servicio no encontrado',
        404
      );
    }
    
    const serviceData = serviceDoc.data();
    actualizacion.precioEstimado = calcularPrecio(serviceData, datosActualizacion.detalle);
    actualizacion.servicio = {
      id: serviceDoc.id,
      nombre: serviceData.nombre
    };
  }

  await pedidoRef.update(actualizacion);

  return {
    id: pedidoId,
    ...pedidoActual,
    ...actualizacion
  };
};

// Soft delete de un pedido
const softDeleteOrder = async (pedidoId) => {
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoDoc = await pedidoRef.get();

  if (!pedidoDoc.exists) {
    throw new AppError(
      ERROR_CODES.ORDER_NOT_FOUND,
      'Pedido no encontrado',
      404
    );
  }

  const pedido = pedidoDoc.data();

  if (pedido.estado === 'Entregado') {
    throw new AppError(
      ERROR_CODES.ORDER_CANNOT_DELETE,
      'No se puede eliminar un pedido ya entregado',
      400
    );
  }

  await pedidoRef.update({
    activo: false,
    fechaEliminacion: new Date(),
    fechaActualizacion: new Date()
  });

  return {
    id: pedidoId,
    message: 'Pedido eliminado correctamente'
  };
};

module.exports = {
  createNewOrder,
  getOrdersByClientId,
  getAllOrders,        
  getOrderById,        
  updateOrderStatus,
  updateOrder,
  softDeleteOrder
};