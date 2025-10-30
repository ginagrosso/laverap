const joi = require('joi');
const { campoNombre, campoTelefono, campoDireccion } = require('./common.schemas');

/**
 * Esquemas de validación para el módulo de usuarios
 */

// Schema para actualizar el perfil del usuario
const actualizarPerfilSchema = joi.object({
  nombre: campoNombre.optional(),
  telefono: campoTelefono,
  direccion: campoDireccion,
  // No permitimos cambiar email ni rol desde aquí
}).min(1) // Al menos un campo debe estar presente
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar.'
  });

// Schema para obtener usuario por ID (parámetro de ruta)
const obtenerUsuarioPorIdSchema = joi.object({
  id: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'El ID del usuario es obligatorio.',
    })
});

module.exports = {
  actualizarPerfilSchema,
  obtenerUsuarioPorIdSchema
};