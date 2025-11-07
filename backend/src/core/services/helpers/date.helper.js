// Helper para manejo de fechas en reportes

// Obtiene rango de fechas del último mes (desde/hasta)
const obtenerRangoDefault = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const hasta = `${año}-${mes}-${dia}`;
  
  const hace30Dias = new Date(hoy);
  hace30Dias.setDate(hoy.getDate() - 30);
  const añoDesde = hace30Dias.getFullYear();
  const mesDesde = String(hace30Dias.getMonth() + 1).padStart(2, '0');
  const diaDesde = String(hace30Dias.getDate()).padStart(2, '0');
  const desde = `${añoDesde}-${mesDesde}-${diaDesde}`;
  
  return { desde, hasta };
};

// Valida que el rango de fechas no supere 1 año
const validarRangoFechas = (desde, hasta) => {
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);
  
  if (fechaDesde > fechaHasta) {
    throw new Error('La fecha "desde" no puede ser mayor que "hasta".');
  }
  
  const diffTime = Math.abs(fechaHasta - fechaDesde);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) {
    throw new Error('El rango de fechas no puede superar 1 año.');
  }
  
  return true;
};

// Filtra array de pedidos por rango de fechas
const filtrarPorRango = (pedidos, desde, hasta) => {
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);
  fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día "hasta"
  
  return pedidos.filter(pedido => {
    const fechaPedido = pedido.fechaCreacion?.toDate 
      ? pedido.fechaCreacion.toDate() 
      : new Date(pedido.fechaCreacion);
    
    return fechaPedido >= fechaDesde && fechaPedido <= fechaHasta;
  });
};

// Agrupa pedidos por mes (formato YYYY-MM)
const agruparPorMes = (pedidos) => {
  const grupos = {};
  
  pedidos.forEach(pedido => {
    const fecha = pedido.fechaCreacion?.toDate 
      ? pedido.fechaCreacion.toDate() 
      : new Date(pedido.fechaCreacion);
    
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grupos[mesKey]) {
      grupos[mesKey] = [];
    }
    grupos[mesKey].push(pedido);
  });
  
  return grupos;
};

// Convierte timestamp de Firestore a Date
const convertirTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

module.exports = {
  obtenerRangoDefault,
  validarRangoFechas,
  filtrarPorRango,
  agruparPorMes,
  convertirTimestamp
};
