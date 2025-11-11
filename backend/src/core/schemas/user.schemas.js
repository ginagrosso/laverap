const joi = require('joi');
const { campoNombre, campoEmail, campoTelefono, campoDireccion } = require('./common.schemas');

// Schema para actualizar el perfil del usuario autenticado
const actualizarPerfilSchema = joi.object({
  nombre: campoNombre.optional(),
  telefono: campoTelefono,
  direccion: campoDireccion,
}).min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar.'
  });

// Schema para validar ID en parámetros de ruta
const usuarioIdParamSchema = joi.object({
  id: joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'El ID del usuario es obligatorio.',
    })
});

// Schema para crear usuario (admin)
const crearUsuarioSchema = joi.object({
  nombre: campoNombre.messages({
    'string.empty': 'El nombre del usuario es obligatorio.',
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no puede superar los 50 caracteres.',
    'any.required': 'El nombre es obligatorio.'
  }),
  email: campoEmail.messages({
    'string.empty': 'El email del usuario es obligatorio.',
    'string.email': 'El formato del email no es válido. Ejemplo: usuario@correo.com',
    'any.required': 'El email es obligatorio.'
  }),
  telefono: campoTelefono.messages({
    'string.pattern.base': 'El teléfono debe tener entre 10 y 15 dígitos numéricos sin espacios ni guiones.'
  }),
  direccion: campoDireccion.messages({
    'string.min': 'La dirección debe tener al menos 5 caracteres.',
    'string.max': 'La dirección no puede superar los 200 caracteres.'
  }),
  rol: joi.string()
    .valid('cliente', 'admin')
    .default('cliente')
    .messages({
      'any.only': 'El rol debe ser "cliente" o "admin".'
    })
});

// Schema para cambiar rol
const cambiarRolSchema = joi.object({
  rol: joi.string()
    .valid('cliente', 'admin')
    .required()
    .messages({
      'any.only': 'El rol debe ser "cliente" o "admin".',
      'any.required': 'El rol es obligatorio.'
    })
});

// Schema para filtros en GET /users
const filtrosUsuariosSchema = joi.object({
  rol: joi.string()
    .valid('cliente', 'admin')
    .optional()
    .messages({
      'any.only': 'El rol debe ser "cliente" o "admin".'
    }),
  activo: joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'El campo activo debe ser true o false.'
    }),
  search: joi.string()
    .trim()
    .min(2)
    .optional()
    .messages({
      'string.min': 'La búsqueda debe tener al menos 2 caracteres.'
    }),
  page: joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.min': 'La página debe ser mayor o igual a 1.',
      'number.base': 'La página debe ser un número.'
    }),
  limit: joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .messages({
      'number.min': 'El límite debe ser mayor o igual a 1.',
      'number.max': 'El límite no puede superar 100.',
      'number.base': 'El límite debe ser un número.'
    })
});

module.exports = {
  actualizarPerfilSchema,
  usuarioIdParamSchema,
  crearUsuarioSchema,
  cambiarRolSchema,
  filtrosUsuariosSchema
};
