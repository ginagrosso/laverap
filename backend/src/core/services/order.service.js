
const db = require('../../config/firebase.config');

const createNewOrder = async (orderData, clienteId) => {
  const { servicioId, detalle, observaciones = null } = orderData;

  const serviceRef = db.collection('servicios').doc(servicioId);
  const serviceDoc = await serviceRef.get();
  if (!serviceDoc.exists) throw new Error('El servicio solicitado no existe.');

  const serviceData = serviceDoc.data();
  let precioEstimado = 0;

  switch (serviceData.modeloDePrecio) {
    
    case 'paqueteConAdicional': {
        const { cantidad = 1, incluyePlanchado = false } = detalle;
        precioEstimado = cantidad * serviceData.precioBase;
        if (incluyePlanchado) {
            const costoAdicional = serviceData.adicionales?.planchado;
            if (typeof costoAdicional !== 'number') {
                throw new Error('Este servicio no tiene configurado el adicional de planchado.');
            }
            precioEstimado += cantidad * costoAdicional;
        }
        break;
    }

    case 'porOpcionesMultiples': {
      const { cantidad = 1, opciones } = detalle;
      if (!opciones || typeof opciones !== 'object') {
        throw new Error('Debe seleccionar las opciones para este servicio.');
      }
      if (cantidad < (serviceData.minimoUnidades || 1)) {
        throw new Error(`Se requiere un mínimo de ${serviceData.minimoUnidades || 1} unidades.`);
      }

      let precioCalculado = serviceData.precioBase;
      for (const categoria in opciones) {
        const seleccion = opciones[categoria];
        const valorOpcion = serviceData.opciones[categoria]?.[seleccion];
        if (typeof valorOpcion !== 'number') {
          throw new Error(`La opción seleccionada '${seleccion}' para '${categoria}' no es válida.`);
        }
        precioCalculado += valorOpcion;
      }
      
      precioEstimado = cantidad * precioCalculado;
      break;
    }
    
    // --- LÓGICA por opciones ---
    case 'porOpciones': {
      const { cantidad = 1, opcion } = detalle;
      if (!opcion || !serviceData.opciones[opcion]) {
        throw new Error('La opción seleccionada no es válida para este servicio.');
      }
      precioEstimado = cantidad * serviceData.opciones[opcion];
      break;
    }

    default:
      throw new Error('El modelo de precios de este servicio no es válido o está mal configurado.');
  }

  const newOrder = {
    clienteId,
    servicio: { id: serviceDoc.id, nombre: serviceData.nombre },
    detalle,
    observaciones,
    precioEstimado,
    estado: 'Recibido',
    fechaCreacion: new Date(),
  };

  const orderRef = await db.collection('pedidos').add(newOrder);
  return { id: orderRef.id, ...newOrder };
};

const getOrdersByClientId = async (clienteId) => {
    const ordersRef = db.collection('pedidos');
    const snapshot = await ordersRef.where('clienteId', '==', clienteId).orderBy('fechaCreacion', 'desc').get();
    if (snapshot.empty) return [];
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    return orders;
};

module.exports = {
  createNewOrder,
  getOrdersByClientId,
};