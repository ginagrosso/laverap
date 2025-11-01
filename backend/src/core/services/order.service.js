const db = require('../../config/firebase.config');
const { calcularPrecio } = require('./helpers/price-calculator');
const { validarTransicionEstado, validarPedidoPagable } = require('./helpers/order.validator');
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
    estado: 'Recibido',
    estadoPago: 'Pendiente',
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
  if (!clienteId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_MISSING_FIELD,
      'El ID del cliente es obligatorio',
      400
    );
  }

  const ordersRef = db.collection('pedidos');
  
  // Solo filtrar por clienteId (sin orderBy para evitar índice compuesto)
  const snapshot = await ordersRef
    .where('clienteId', '==', clienteId)
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
  const snapshot = await ordersRef.get();
  
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
  if (!pedidoId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_MISSING_FIELD,
      'El ID del pedido es obligatorio',
      400
    );
  }

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
 * Valida que la transición de estado sea válida
 */
const updateOrderStatus = async (pedidoId, nuevoEstado, observaciones = null) => {
  if (!pedidoId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_MISSING_FIELD,
      'El ID del pedido es obligatorio',
      400
    );
  }

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

  // Validar que la transición de estado sea válida
  validarTransicionEstado(estadoActual, nuevoEstado);

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

/**
 * Registra un pago para un pedido
 * Valida que el pedido pueda recibir un pago
 */
const registerPayment = async (pedidoId, datosPago) => {
  if (!pedidoId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_MISSING_FIELD,
      'El ID del pedido es obligatorio',
      400
    );
  }

  // Obtener el pedido
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoDoc = await pedidoRef.get();
  
  if (!pedidoDoc.exists) {
    throw new AppError(
      ERROR_CODES.ORDER_NOT_FOUND,
      'Pedido no encontrado',
      404
    );
  }

  const pedidoActual = { id: pedidoId, ...pedidoDoc.data() };

  // Validar que el pedido se pueda pagar
  validarPedidoPagable(pedidoActual);

  // Registrar el pago en Firestore
  const datosActualizacion = {
    estadoPago: 'Pagado',
    metodoPago: datosPago.metodo,
    montoPagado: datosPago.monto,
    fechaPago: new Date(),
    fechaActualizacion: new Date()
  };

  // Si hay observaciones sobre el pago, agregarlas
  if (datosPago.observaciones) {
    datosActualizacion.observacionesPago = datosPago.observaciones;
  }

  await pedidoRef.update(datosActualizacion);

  return { 
    ...pedidoActual, 
    ...datosActualizacion 
  };
};

module.exports = {
  createNewOrder,
  getOrdersByClientId,
  getAllOrders,        
  getOrderById,        
  updateOrderStatus,   
  registerPayment      
};