/**
 * Validadores de lógica de negocio para pedidos
 * Funciones helper para validar transiciones y reglas de negocio
 */

/**
 * Matriz de transiciones válidas entre estados de pedidos
 */
const TRANSICIONES_VALIDAS = {
  'Recibido': ['En Proceso', 'Cancelado'],
  'En Proceso': ['Listo', 'Cancelado'],
  'Listo': ['Entregado', 'Cancelado'],
  'Entregado': [],  // Estado final
  'Cancelado': []   // Estado final
};

/**
 * Valida si una transición de estado es válida
 * @param {string} estadoActual - Estado actual del pedido
 * @param {string} nuevoEstado - Estado al que se quiere cambiar
 * @returns {boolean} true si la transición es válida
 * @throws {Error} si la transición no es válida
 */
const validarTransicionEstado = (estadoActual, nuevoEstado) => {
  // Verificar que el estado actual existe
  if (!TRANSICIONES_VALIDAS[estadoActual]) {
    throw new Error(`Estado actual inválido: "${estadoActual}".`);
  }

  // Obtener transiciones permitidas
  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];
  
  // Verificar si el nuevo estado es válido
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
 * @param {Object} pedido - Objeto del pedido
 * @returns {boolean} true si se puede pagar
 * @throws {Error} si el pedido no puede recibir un pago
 */
const validarPedidoPagable = (pedido) => {
  const estadosPermitidos = ['Listo', 'Entregado'];
  
  // Verificar que el pedido esté en un estado pagable
  if (!estadosPermitidos.includes(pedido.estado)) {
    throw new Error(
      `No se puede registrar el pago. El pedido debe estar en estado "Listo" o "Entregado". ` +
      `Estado actual: "${pedido.estado}".`
    );
  }

  // Verificar que no esté ya pagado
  if (pedido.estadoPago === 'Pagado') {
    throw new Error('Este pedido ya fue pagado anteriormente.');
  }

  return true;
};

module.exports = {
  validarTransicionEstado,
  validarPedidoPagable
};