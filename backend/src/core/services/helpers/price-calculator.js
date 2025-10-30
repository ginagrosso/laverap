/**
 * Helper para cálculo de precios de pedidos
 * Contiene la lógica de cálculo según el modelo de precios del servicio
 */

/**
 * Calcula el precio estimado de un pedido según el modelo de precios del servicio
 * @param {Object} serviceData - Datos del servicio con configuración de precios
 * @param {Object} detalle - Detalle del pedido (opciones seleccionadas por el cliente)
 * @returns {number} - Precio estimado del pedido
 * @throws {Error} - Si hay errores en la configuración o selecciones inválidas
 */
const calcularPrecio = (serviceData, detalle) => {
  const { modeloDePrecio } = serviceData;

  // Delegar el cálculo según el modelo de precios
  switch (modeloDePrecio) {
    case 'paqueteConAdicional':
      return calcularPrecioPaqueteConAdicional(serviceData.configuracionPrecios, detalle);
    
    case 'porOpcionesMultiples':
      return calcularPrecioPorOpcionesMultiples(serviceData.configuracionPrecios, detalle);
    
    case 'porOpciones':
      return calcularPrecioPorOpciones(serviceData.configuracionPrecios, detalle);
    
    default:
      throw new Error('El modelo de precios de este servicio no es válido o está mal configurado.');
  }
};

/**
 * Calcula el precio para modelo "paqueteConAdicional"
 * Precio base del paquete + suma de adicionales seleccionados
 */
const calcularPrecioPaqueteConAdicional = (configuracionPrecios, detalle) => {
  const { paqueteBase, adicionales = [] } = detalle;
  
  // Validar que se seleccionó un paquete base
  if (!paqueteBase) {
    throw new Error('Debe seleccionar un paquete base.');
  }

  // Validar que el servicio tenga paquete base configurado
  const paquete = configuracionPrecios.paqueteBase;
  if (!paquete) {
    throw new Error('El servicio no tiene un paquete base configurado.');
  }
  
  // Iniciar con el precio del paquete base
  let precio = paquete.precio;

  // Sumar el precio de cada adicional seleccionado
  if (adicionales.length > 0) {
    const adicionalesDisponibles = configuracionPrecios.adicionales || [];
    adicionales.forEach(adicionalNombre => {
      const adicional = adicionalesDisponibles.find(a => a.nombre === adicionalNombre);
      if (adicional) {
        precio += adicional.precio;
      }
    });
  }

  return precio;
};

/**
 * Calcula el precio para modelo "porOpcionesMultiples"
 * (Precio base + suma de opciones seleccionadas) * cantidad
 */
const calcularPrecioPorOpcionesMultiples = (configuracionPrecios, detalle) => {
  const { opciones = [], cantidad = 1 } = detalle;
  
  // Validar que se seleccionó al menos una opción
  if (!opciones || opciones.length === 0) {
    throw new Error('Debe seleccionar al menos una opción.');
  }

  const opcionesDisponibles = configuracionPrecios.opciones || [];
  const precioBase = configuracionPrecios.precioBase || 0;
  
  // Sumar el precio de cada opción seleccionada
  let precioOpciones = 0;
  opciones.forEach(opcionNombre => {
    const opcion = opcionesDisponibles.find(o => o.nombre === opcionNombre);
    if (opcion) {
      precioOpciones += opcion.precio;
    }
  });

  // Calcular precio total: (base + opciones) * cantidad
  return (precioBase + precioOpciones) * cantidad;
};

/**
 * Calcula el precio para modelo "porOpciones"
 * Precio de la opción seleccionada
 */
const calcularPrecioPorOpciones = (configuracionPrecios, detalle) => {
  const { opcion } = detalle;
  
  // Validar que se seleccionó una opción
  if (!opcion) {
    throw new Error('Debe seleccionar una opción.');
  }

  const opcionesSimples = configuracionPrecios.opcionesSimples || [];
  const opcionSeleccionada = opcionesSimples.find(o => o.nombre === opcion);
  
  // Validar que la opción existe
  if (!opcionSeleccionada) {
    throw new Error('La opción seleccionada no es válida.');
  }

  return opcionSeleccionada.precio;
};

module.exports = {
  calcularPrecio
};
