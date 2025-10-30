/**
 * Tests unitarios para validaciones
 * Ejecutar con: node tests/validations.test.js
 * 
 * NOTA: Las validaciones de lógica de negocio (validarTransicionEstado, validarPedidoPagable)
 * están ahora integradas en order.service.js como funciones internas.
 * Estos tests solo validan los schemas de Joi.
 */

// Importar schemas
const { registrarPagoSchema } = require('../src/core/schemas/payment.schemas');
const { 
  crearPedidoSchema, 
  actualizarEstadoPedidoSchema 
} = require('../src/core/schemas/order.schemas');

console.log('🧪 INICIANDO TESTS DE VALIDACIONES\n');
console.log('='.repeat(60));

// ========================================
// TESTS DE PAYMENT SCHEMAS
// ========================================
console.log('\n📦 TESTS: payment.schemas.js');
console.log('-'.repeat(60));

// Test 1: Pago válido
console.log('\n✅ Test 1: Pago válido con todos los campos');
const pagoValido = {
  metodo: 'efectivo',
  monto: 500.50,
  observaciones: 'Pagó con billete de $1000'
};
const resultPago1 = registrarPagoSchema.validate(pagoValido);
if (!resultPago1.error) {
  console.log('   ✓ Pago validado correctamente');
  console.log('   Datos:', resultPago1.value);
} else {
  console.log('   ✗ ERROR:', resultPago1.error.message);
}

// Test 2: Pago inválido (método incorrecto)
console.log('\n❌ Test 2: Pago con método inválido');
const pagoInvalido1 = {
  metodo: 'bitcoin',  // ❌ No es un método válido
  monto: 500
};
const resultPago2 = registrarPagoSchema.validate(pagoInvalido1);
if (resultPago2.error) {
  console.log('   ✓ Error detectado correctamente:');
  console.log('   -', resultPago2.error.details[0].message);
} else {
  console.log('   ✗ ERROR: Debería haber fallado');
}

// Test 3: Pago inválido (monto negativo)
console.log('\n❌ Test 3: Pago con monto negativo');
const pagoInvalido2 = {
  metodo: 'efectivo',
  monto: -100  // ❌ Monto negativo
};
const resultPago3 = registrarPagoSchema.validate(pagoInvalido2);
if (resultPago3.error) {
  console.log('   ✓ Error detectado correctamente:');
  console.log('   -', resultPago3.error.details[0].message);
} else {
  console.log('   ✗ ERROR: Debería haber fallado');
}

// Test 4: Pago sin monto (campo obligatorio)
console.log('\n❌ Test 4: Pago sin monto');
const pagoInvalido3 = {
  metodo: 'efectivo'
  // falta: monto
};
const resultPago4 = registrarPagoSchema.validate(pagoInvalido3);
if (resultPago4.error) {
  console.log('   ✓ Error detectado correctamente:');
  console.log('   -', resultPago4.error.details[0].message);
} else {
  console.log('   ✗ ERROR: Debería haber fallado');
}

// ========================================
// TESTS DE ORDER SCHEMAS
// ========================================
console.log('\n\n📦 TESTS: order.schemas.js');
console.log('-'.repeat(60));

// Test 5: Crear pedido válido
console.log('\n✅ Test 5: Crear pedido válido');
const pedidoValido = {
  servicioId: '12345678901234567890',  // 20 caracteres
  detalle: {
    paqueteBase: 'Básico',
    adicionales: ['Planchado']
  },
  observaciones: 'Sin suavizante'
};
const resultPedido1 = crearPedidoSchema.validate(pedidoValido);
if (!resultPedido1.error) {
  console.log('   ✓ Pedido validado correctamente');
} else {
  console.log('   ✗ ERROR:', resultPedido1.error.message);
}

// Test 6: Pedido inválido (servicioId incorrecto)
console.log('\n❌ Test 6: Pedido con servicioId inválido');
const pedidoInvalido1 = {
  servicioId: '123',  // ❌ Menos de 20 caracteres
  detalle: {
    paqueteBase: 'Básico'
  }
};
const resultPedido2 = crearPedidoSchema.validate(pedidoInvalido1);
if (resultPedido2.error) {
  console.log('   ✓ Error detectado correctamente:');
  console.log('   -', resultPedido2.error.details[0].message);
} else {
  console.log('   ✗ ERROR: Debería haber fallado');
}

// Test 7: Actualizar estado válido
console.log('\n✅ Test 7: Actualizar estado válido');
const estadoValido = {
  estado: 'En Proceso',
  observaciones: 'Pedido en lavado'
};
const resultEstado1 = actualizarEstadoPedidoSchema.validate(estadoValido);
if (!resultEstado1.error) {
  console.log('   ✓ Estado validado correctamente');
} else {
  console.log('   ✗ ERROR:', resultEstado1.error.message);
}

// Test 8: Actualizar estado inválido
console.log('\n❌ Test 8: Actualizar estado inválido');
const estadoInvalido = {
  estado: 'Estado Inventado'  // ❌ No es un estado válido
};
const resultEstado2 = actualizarEstadoPedidoSchema.validate(estadoInvalido);
if (resultEstado2.error) {
  console.log('   ✓ Error detectado correctamente:');
  console.log('   -', resultEstado2.error.details[0].message);
} else {
  console.log('   ✗ ERROR: Debería haber fallado');
}

// ========================================
// RESUMEN
// ========================================
console.log('\n\n' + '='.repeat(60));
console.log('✅ TODOS LOS TESTS COMPLETADOS (8/8)');
console.log('='.repeat(60));
console.log('\n💡 Nota: Las validaciones de lógica de negocio están integradas en order.service.js');
console.log('   y se testearán cuando se implementen los endpoints correspondientes.\n');
