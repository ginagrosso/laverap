const db = require('../../config/firebase.config');
const { crearPedidoSchema } = require('../schemas/order.schemas');
const { calcularPrecio } = require('./helpers/price-calculator');

/**
 * Servicio para gestionar pedidos
 */

// ==========================================
// CONSTANTES Y VALIDADORES INTERNOS
// ==========================================

/**
 * Matriz de transiciones válidas entre estados de pedidos
 * Define las reglas de negocio para cambios de estado
 */
const TRANSICIONES_VALIDAS = {
  'Recibido': ['En Proceso', 'Cancelado'],      // Un pedido recibido puede pasar a proceso o cancelarse
  'En Proceso': ['Listo', 'Cancelado'],         // En proceso puede completarse o cancelarse
  'Listo': ['Entregado', 'Cancelado'],          // Listo puede entregarse o cancelarse
  'Entregado': [],                               // Estado final: no puede cambiar
  'Cancelado': []                                // Estado final: no puede cambiar
};

/**
 * Valida si una transición de estado es válida según las reglas de negocio
 * @param {string} estadoActual - Estado actual del pedido
 * @param {string} nuevoEstado - Estado al que se quiere cambiar
 * @returns {boolean} - True si la transición es válida
 * @throws {Error} - Si la transición no es válida
 */
const validarTransicionEstado = (estadoActual, nuevoEstado) => {
  // Verificar que el estado actual existe en la matriz
  if (!TRANSICIONES_VALIDAS[estadoActual]) {
    throw new Error(`Estado actual inválido: "${estadoActual}".`);
  }

  // Obtener las transiciones permitidas desde el estado actual
  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];
  
  // Verificar si el nuevo estado está en la lista de transiciones permitidas
  if (!transicionesPermitidas.includes(nuevoEstado)) {
    const opcionesTexto = transicionesPermitidas.length > 0 
      ? transicionesPermitidas.join(', ') 
      : 'ninguna (estado final)';
      
    throw new Error(
      `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". ` +
      `Transiciones válidas: ${opcionesTexto}.`
    );
  }

  return true;
};

/**
 * Valida que un pedido pueda recibir un pago
 * Solo se pueden pagar pedidos en estado "Listo" o "Entregado"
 * @param {Object} pedido - Objeto del pedido con sus datos
 * @returns {boolean} - True si se puede registrar el pago
 * @throws {Error} - Si el pedido no está en un estado que permita pagos
 */
const validarPedidoPagable = (pedido) => {
  // Lista de estados en los que se permite registrar un pago
  const estadosPermitidos = ['Listo', 'Entregado'];
  
  // Verificar que el pedido esté en un estado válido para pago
  if (!estadosPermitidos.includes(pedido.estado)) {
    throw new Error(
      `No se puede registrar el pago. El pedido debe estar en estado "Listo" o "Entregado". ` +
      `Estado actual: "${pedido.estado}".`
    );
  }

  // Verificar que el pedido no esté ya pagado
  if (pedido.estadoPago === 'Pagado') {
    throw new Error('Este pedido ya fue pagado anteriormente.');
  }

  return true;
};

// ==========================================
// FUNCIONES PÚBLICAS DEL SERVICIO
// ==========================================

/**
 * Crea un nuevo pedido en Firestore
 * @param {Object} orderData - Datos del pedido (servicioId, detalle, observaciones)
 * @param {string} clienteId - ID del cliente que realiza el pedido
 * @returns {Promise<Object>} - Pedido creado con su ID
 */
const createNewOrder = async (orderData, clienteId) => {
  // Validar datos de entrada con Joi
  const { error, value } = crearPedidoSchema.validate(orderData, { abortEarly: false });
  
  if (error) {
    const mensajes = error.details.map(err => err.message).join(', ');
    throw new Error(`Errores de validación: ${mensajes}`);
  }

  const { servicioId, detalle, observaciones = null } = value;

  // Verificar que el servicio existe
  const serviceRef = db.collection('servicios').doc(servicioId);
  const serviceDoc = await serviceRef.get();
  
  if (!serviceDoc.exists) {
    throw new Error('El servicio solicitado no existe.');
  }

  const serviceData = serviceDoc.data();
  
  // Verificar que el servicio esté activo
  if (serviceData.activo === false) {
    throw new Error('El servicio seleccionado no está disponible actualmente.');
  }

  // Calcular precio estimado usando el helper
  const precioEstimado = calcularPrecio(serviceData, detalle);

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
 * @param {string} clienteId - ID del cliente
 * @returns {Promise<Array>} - Lista de pedidos ordenados por fecha descendente
 */
const getOrdersByClientId = async (clienteId) => {
  if (!clienteId) {
    throw new Error('El ID del cliente es obligatorio.');
  }

  const ordersRef = db.collection('pedidos');
  
  // Solo filtrar por clienteId (sin orderBy para evitar índice compuesto)
  const snapshot = await ordersRef
    .where('clienteId', '==', clienteId)
    .get();
  
  if (snapshot.empty) {
    return [];
  }

  const orders = [];
  snapshot.forEach(doc => {
    orders.push({ 
      id: doc.id, 
      ...doc.data() 
    });
  });

  // Ordenar en memoria por fechaCreacion descendente (más reciente primero)
  return orders.sort((a, b) => {
    const dateA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion);
    const dateB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion);
    return dateB - dateA;
  });
};

module.exports = {
  createNewOrder,
  getOrdersByClientId,
};