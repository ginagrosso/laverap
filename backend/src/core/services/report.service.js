const db = require('../../config/firebase.config');
const { obtenerRangoDefault, validarRangoFechas, agruparPorMes, filtrarPorRango } = require('./helpers/date.helper');

// Resumen general del dashboard
async function getSummary() {
  const pedidosSnapshot = await db.collection('pedidos').where('activo', '==', true).get();
  const clientesSnapshot = await db.collection('clientes').get();
  const serviciosSnapshot = await db.collection('servicios').get();

  const pedidos = pedidosSnapshot.docs.map(doc => doc.data());
  const clientes = clientesSnapshot.docs.map(doc => doc.data());

  const totalPedidos = pedidos.length;
  const totalClientes = clientes.filter(c => c.rol === 'cliente').length;
  const totalServicios = serviciosSnapshot.size;

  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
  const pedidosEnProceso = pedidos.filter(p => p.estado === 'En Proceso').length;

  const ingresosTotales = pedidos.reduce((sum, p) => sum + (p.precioEstimado || 0), 0);

  return {
    totalPedidos,
    totalClientes,
    totalServicios,
    pedidosPendientes,
    pedidosEnProceso,
    ingresosTotales
  };
}

// Pedidos agrupados por estado en un rango de fechas
async function getOrdersByStatus(desde, hasta) {
  if (!desde && !hasta) {
    const rango = obtenerRangoDefault();
    desde = rango.desde;
    hasta = rango.hasta;
  } else if (!hasta) {
    const desdeDate = new Date(desde);
    desdeDate.setDate(desdeDate.getDate() + 365);
    hasta = desdeDate.toISOString().split('T')[0];
  } else if (!desde) {
    const hastaDate = new Date(hasta);
    hastaDate.setDate(hastaDate.getDate() - 30);
    desde = hastaDate.toISOString().split('T')[0];
  }
  validarRangoFechas(desde, hasta);

  const pedidosSnapshot = await db.collection('pedidos').where('activo', '==', true).get();
  const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const pedidosFiltrados = filtrarPorRango(pedidos, desde, hasta);

  const porEstado = pedidosFiltrados.reduce((acc, p) => {
    const estado = p.estado || 'Sin estado';
    if (!acc[estado]) {
      acc[estado] = { cantidad: 0, pedidos: [] };
    }
    acc[estado].cantidad++;
    acc[estado].pedidos.push(p.id);
    return acc;
  }, {});

  return {
    desde,
    hasta,
    totalPedidos: pedidosFiltrados.length,
    porEstado
  };
}

// Ingresos totales y agrupados por mes
async function getRevenue(desde, hasta) {
  if (!desde && !hasta) {
    const rango = obtenerRangoDefault();
    desde = rango.desde;
    hasta = rango.hasta;
  } else if (!hasta) {
    const desdeDate = new Date(desde);
    desdeDate.setDate(desdeDate.getDate() + 365);
    hasta = desdeDate.toISOString().split('T')[0];
  } else if (!desde) {
    const hastaDate = new Date(hasta);
    hastaDate.setDate(hastaDate.getDate() - 30);
    desde = hastaDate.toISOString().split('T')[0];
  }
  validarRangoFechas(desde, hasta);

  const pedidosSnapshot = await db.collection('pedidos')
    .where('activo', '==', true)
    .where('estado', 'in', ['Finalizado', 'Entregado'])
    .get();
  const pedidos = pedidosSnapshot.docs.map(doc => doc.data());

  const pedidosFiltrados = filtrarPorRango(pedidos, desde, hasta);

  const ingresoTotal = pedidosFiltrados.reduce((sum, p) => sum + (p.precioEstimado || 0), 0);
  const cantidadPedidos = pedidosFiltrados.length;
  const ingresoPromedio = cantidadPedidos > 0 ? ingresoTotal / cantidadPedidos : 0;

  const porMes = agruparPorMes(pedidosFiltrados);
  const ingresosPorMes = Object.entries(porMes).map(([mes, pedidosMes]) => ({
    mes,
    ingreso: pedidosMes.reduce((sum, p) => sum + (p.precioEstimado || 0), 0),
    cantidad: pedidosMes.length
  }));

  return {
    desde,
    hasta,
    ingresoTotal,
    cantidadPedidos,
    ingresoPromedio,
    ingresosPorMes
  };
}

// Servicios más populares
async function getPopularServices(limite = 10) {
  const pedidosSnapshot = await db.collection('pedidos').where('activo', '==', true).get();
  const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const conteoServicios = {};
  pedidos.forEach(pedido => {
    if (pedido.servicio && pedido.servicio.id) {
      const servicioId = pedido.servicio.id;
      if (!conteoServicios[servicioId]) {
        conteoServicios[servicioId] = {
          servicioId,
          nombre: pedido.servicio.nombre || 'Sin nombre',
          cantidad: 0,
          ingresoTotal: 0
        };
      }
      conteoServicios[servicioId].cantidad++;
      conteoServicios[servicioId].ingresoTotal += pedido.precioEstimado || 0;
    }
  });

  const serviciosOrdenados = Object.values(conteoServicios).sort((a, b) => b.cantidad - a.cantidad);
  const topServicios = serviciosOrdenados.slice(0, limite);

  return {
    totalServicios: serviciosOrdenados.length,
    topServicios
  };
}

// Estadísticas de clientes
async function getClientsStats() {
  const pedidosSnapshot = await db.collection('pedidos').where('activo', '==', true).get();
  const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const clientesSnapshot = await db.collection('clientes').where('rol', '==', 'cliente').get();
  const totalClientes = clientesSnapshot.size;

  // Crear mapa de clientes para búsqueda rápida
  const clientesMap = {};
  clientesSnapshot.docs.forEach(doc => {
    const clienteData = doc.data();
    clientesMap[doc.id] = {
      nombre: clienteData.nombre || 'Sin nombre',
      email: clienteData.email || 'Sin email'
    };
  });

  const conteoPorCliente = {};
  pedidos.forEach(pedido => {
    const clienteId = pedido.clienteId;
    if (!conteoPorCliente[clienteId]) {
      const clienteInfo = clientesMap[clienteId] || { nombre: 'Sin nombre', email: 'Sin email' };
      conteoPorCliente[clienteId] = {
        clienteId,
        nombre: clienteInfo.nombre,
        email: clienteInfo.email,
        cantidadPedidos: 0,
        ingresoTotal: 0
      };
    }
    conteoPorCliente[clienteId].cantidadPedidos++;
    conteoPorCliente[clienteId].ingresoTotal += pedido.precioEstimado || 0;
  });

  const clientesOrdenados = Object.values(conteoPorCliente).sort((a, b) => b.ingresoTotal - a.ingresoTotal);
  const topClientes = clientesOrdenados.slice(0, 10);

  const clientesActivos = Object.keys(conteoPorCliente).length;
  const ingresoPromedioPorCliente = clientesActivos > 0 
    ? clientesOrdenados.reduce((sum, c) => sum + c.ingresoTotal, 0) / clientesActivos 
    : 0;

  return {
    totalClientes,
    clientesActivos,
    ingresoPromedioPorCliente,
    topClientes
  };
}

module.exports = {
  getSummary,
  getOrdersByStatus,
  getRevenue,
  getPopularServices,
  getClientsStats
};
