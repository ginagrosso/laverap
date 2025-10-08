const db = require('../../config/firebase.config');

const createNewOrder = async (orderData, clienteId) => {
  const { servicioId, detalle, observaciones } = orderData;

  const serviceRef = db.collection('servicios').doc(servicioId);
  const serviceDoc = await serviceRef.get();

  if (!serviceDoc.exists) {
    throw new Error('El servicio solicitado no existe.');
  }

  const serviceData = serviceDoc.data();
  let precioEstimado = 0;

  // Lógica de cálculo de precio según el modelo del servicio
  switch (serviceData.modeloDePrecio) {
    case 'porCanasto': {
      const { cantidadPrendasNormales = 0, cantidadSabanas2Plazas = 0 } = detalle;
      
      // La excepción de las sábanas se calcula aquí
      const totalItems = cantidadPrendasNormales + (cantidadSabanas2Plazas * 2);

      if (totalItems < serviceData.minimoItems) {
        throw new Error(`Se requiere un mínimo de ${serviceData.minimoItems} prendas para este servicio.`);
      }

      // Calculamos canastos, redondeando hacia arriba a la fracción de 0.5
      const canastos = Math.ceil(totalItems / (serviceData.itemsPorCanasto / 2)) * 0.5;
      precioEstimado = canastos * serviceData.precioPorCanasto;
      break;
    }

    case 'porUnidad': {
      const { cantidad, opciones } = detalle;
      if (cantidad < serviceData.minimoUnidades) {
        throw new Error(`Se requiere un mínimo de ${serviceData.minimoUnidades} unidades.`);
      }
      
      let precioPorUnidad = serviceData.precioBase || 0;
      if (serviceData.opcionesDePrecio && opciones) {
        for (const categoria in opciones) {
          const seleccion = opciones[categoria];
          precioPorUnidad += serviceData.opcionesDePrecio[categoria]?.[seleccion] || 0;
        }
      }
      
      precioEstimado = cantidad * precioPorUnidad;
      break;
    }

    default:
      throw new Error('El servicio no tiene un modelo de precios configurado.');
  }

  const newOrder = {
    clienteId,
    servicio: { id: serviceDoc.id, nombre: serviceData.nombre },
    detalle,
    observaciones,
    precioEstimado, // El precio es un estimado y puede cambiar
    estado: 'Recibido',
    fechaCreacion: new Date(),
  };

  const orderRef = await db.collection('pedidos').add(newOrder);
  return { id: orderRef.id, ...newOrder };
};

const getOrdersByClientId = async (clienteId) => {
    // Esta función no necesita cambios
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