/**
 * Validadores de lógica de negocio para pedidos
 * Funciones helper para validar transiciones y reglas de negocio
 */

// Estados válidos del pedido
const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'];

/**
 * Valida si la transición de estado es permitida
 * Flujo: Pendiente → En Proceso → Finalizado → Entregado
 * 
 * @param {string} estadoActual - Estado actual del pedido
 * @param {string} nuevoEstado - Nuevo estado deseado
 * @param {string} rolUsuario - Rol del usuario ('cliente' o 'admin')
 */
const validarTransicionEstado = (estadoActual, nuevoEstado, rolUsuario = 'admin') => {
  // Transiciones de estado permitidas según el rol
  const TRANSICIONES_ADMIN = {
    'Pendiente': ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
    'En Proceso': ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
    'Finalizado': ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
    'Entregado': ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
    'Cancelado': ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado']
  };

  const TRANSICIONES_CLIENTE = {
    'Pendiente': ['Cancelado'],
    'En Proceso': [],
    'Finalizado': [],
    'Entregado': [],
    'Cancelado': []
  };

  // Selecciona las transiciones según el rol
  const transicionesPermitidas = rolUsuario === 'admin' 
    ? TRANSICIONES_ADMIN[estadoActual] 
    : TRANSICIONES_CLIENTE[estadoActual];

  // Verifica que el estado actual sea válido
  if (!ESTADOS_VALIDOS.includes(estadoActual)) {
    throw new Error(`Estado actual inválido: "${estadoActual}".`);
  }

  // Verifica que el nuevo estado sea válido
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new Error(`Estado nuevo inválido: "${nuevoEstado}".`);
  }

  // Verifica que la transición sea permitida
  if (!transicionesPermitidas || !transicionesPermitidas.includes(nuevoEstado)) {
    const mensajeCliente = rolUsuario === 'cliente' 
      ? 'Los clientes solo pueden cancelar pedidos en estado "Pendiente".'
      : `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". Transiciones permitidas: ${transicionesPermitidas?.join(', ') || 'ninguna'}`;
    
    throw new Error(mensajeCliente);
  }

  return true;
};

module.exports = {
  validarTransicionEstado,
  ESTADOS_VALIDOS
};