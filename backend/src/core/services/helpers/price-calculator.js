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

  // Delegar el cálculo según el modelo de precios de Firebase
  switch (modeloDePrecio) {
    case 'paqueteConAdicional':
      return calcularPrecioPaqueteConAdicional(serviceData, detalle);
    
    case 'porOpcionesMultiples':
      return calcularPrecioPorOpcionesMultiples(serviceData, detalle);
    
    case 'porOpciones':
      return calcularPrecioPorOpciones(serviceData, detalle);
    
    default:
      throw new Error(`Modelo de precio no soportado: ${modeloDePrecio}`);
  }
};

/**
 * Calcula el precio para modelo "paqueteConAdicional"
 * Ejemplo: "Paquete 12 Prendas" - precioBase + adicionales opcionales (planchado)
 */
const calcularPrecioPaqueteConAdicional = (serviceData, detalle) => {
  // Iniciar con el precio base del servicio
  let precioTotal = serviceData.precioBase;

  // Sumar adicionales si fueron seleccionados
  if (detalle.adicionales && Array.isArray(detalle.adicionales)) {
    detalle.adicionales.forEach(adicionalNombre => {
      // Los adicionales en Firebase están en minúsculas (ej: "planchado")
      const adicionalKey = adicionalNombre.toLowerCase();
      const precioAdicional = serviceData.adicionales?.[adicionalKey];
      
      if (precioAdicional !== undefined) {
        precioTotal += precioAdicional;
      }
    });
  }

  return precioTotal;
};

/**
 * Calcula el precio para modelo "porOpcionesMultiples"
 * Ejemplo: "Lavado de Acolchados" - suma de opciones de diferentes categorías (Tamaño + Tipo)
 */
const calcularPrecioPorOpcionesMultiples = (serviceData, detalle) => {
  let precioTotal = 0;

  // Recorrer cada categoría de opciones disponibles (ej: "Tamaño", "Tipo")
  const categoriasOpciones = serviceData.opciones || {};
  
  Object.keys(categoriasOpciones).forEach(categoria => {
    // Obtener la opción seleccionada por el cliente para esta categoría
    const opcionSeleccionada = detalle[categoria];
    
    if (opcionSeleccionada) {
      // Buscar el precio de la opción seleccionada en Firebase
      const precioOpcion = categoriasOpciones[categoria][opcionSeleccionada];
      
      if (precioOpcion !== undefined) {
        precioTotal += precioOpcion;
      }
    }
  });

  return precioTotal;
};

/**
 * Calcula el precio para modelo "porOpciones"
 * Ejemplo: "Lavado Prendas Especiales" - precio de una sola opción seleccionada (CAMPERAS, SACOS, etc.)
 */
const calcularPrecioPorOpciones = (serviceData, detalle) => {
  const opcionSeleccionada = detalle.opcion;
  
  // Validar que se seleccionó una opción
  if (!opcionSeleccionada) {
    throw new Error('Debe seleccionar una opción.');
  }

  // Buscar el precio de la opción en Firebase
  const precio = serviceData.opciones?.[opcionSeleccionada];
  
  // Validar que la opción existe en el servicio
  if (precio === undefined) {
    throw new Error(`La opción "${opcionSeleccionada}" no es válida.`);
  }

  return precio;
};

module.exports = {
  calcularPrecio
};
