# 🧺 Laverap - Sistema de Gestión para Lavadero

Sistema web para gestionar pedidos, clientes y servicios de un lavadero automático.

---

## 📁 Estructura del Proyecto

```
laverrap/
├── backend/           # API REST (Node.js + Express + Firebase)
├── frontend/          # Aplicación web (React + Vite + TypeScript)
└── docs/             # Documentación del proyecto
```

---

## 🚀 Inicio Rápido

### Prerequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta de **Firebase** (Firestore + Authentication)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/laverrap.git
cd laverrap
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` con tus credenciales:

```env
PORT=8080
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com
JWT_SECRET=tu-secreto-super-seguro-aqui
NODE_ENV=development
```

Iniciar servidor:

```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=/api/v1
```

Iniciar aplicación:

```bash
npm run dev
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/api/v1

---

## 🏗️ Arquitectura del Backend

### Estructura de Carpetas

```
backend/src/
├── api/                      # Capa de API (Express)
│   ├── controllers/          # Controladores (lógica de rutas)
│   ├── middlewares/          # Middlewares (auth, validación, etc.)
│   └── routes/               # Definición de rutas
├── config/                   # Configuraciones (Firebase, etc.)
├── core/                     # Lógica de negocio
│   ├── schemas/              # Validaciones con Joi
│   └── services/             # Servicios (lógica principal)
├── app.js                    # Configuración de Express
└── server.js                 # Punto de entrada
```

### Flujo de una Request

```
Request → Route → Middleware → Controller → Service → Firebase
                    ↓
                Validación (Joi)
                Autenticación (JWT)
```

---

## 📚 Schemas y Validaciones (Joi)

### Schemas Disponibles

#### 1. **`common.schemas.js`** - Campos Reutilizables

```javascript
const { 
  campoEmail,          // Email validado (lowercase, trim)
  campoPassword,       // Contraseña (min 6, max 128)
  campoNombre,         // Nombre (min 2, max 50)
  campoTelefono,       // Teléfono (10-15 dígitos)
  campoDireccion,      // Dirección (min 5, max 200)
  campoFirebaseId,     // ID de Firebase (20 caracteres)
  campoObservaciones,  // Observaciones (max 500)
  campoEstadoPedido,   // Estado: Recibido, En Proceso, etc.
  campoPrecio          // Precio positivo con 2 decimales
} = require('./common.schemas');
```

#### 2. **`auth.schemas.js`** - Autenticación

```javascript
// Registro de usuario
const registerSchema = joi.object({
  email: campoEmail,
  password: campoPassword,
  nombre: campoNombre,
  telefono: campoTelefono.optional(),
  direccion: campoDireccion.optional()
});

// Login
const loginSchema = joi.object({
  email: campoEmail,
  password: campoPassword
});
```

#### 3. **`order.schemas.js`** - Pedidos

```javascript
// Crear pedido
const crearPedidoSchema = joi.object({
  servicioId: campoFirebaseId,
  detalle: joi.object({
    paqueteBase: joi.string().optional(),
    adicionales: joi.array().items(joi.string()).optional(),
    opciones: joi.array().items(joi.string()).optional(),
    cantidad: joi.number().integer().min(1).optional(),
    opcion: joi.string().optional()
  }).required(),
  observaciones: campoObservaciones
});
```

#### 4. **`service.schemas.js`** - Servicios

```javascript
// Crear/actualizar servicio
const servicioSchema = joi.object({
  nombre: campoNombre,
  descripcion: joi.string().min(10).max(500).required(),
  modeloDePrecio: joi.string()
    .valid('paqueteConAdicional', 'porOpcionesMultiples', 'porOpciones')
    .required(),
  configuracionPrecios: joi.object().required(),
  activo: joi.boolean().default(true),
  imagen: joi.string().uri().optional()
});
```

#### 5. **`user.schemas.js`** - Usuarios

```javascript
// Actualizar perfil
const actualizarPerfilSchema = joi.object({
  nombre: campoNombre.optional(),
  telefono: campoTelefono,
  direccion: campoDireccion
}).min(1); // Al menos un campo
```

### Uso del Middleware de Validación

```javascript
const { validate } = require('../middlewares/validate.middleware');

// Validar body
router.post('/orders', protect, validate(crearPedidoSchema, 'body'), orderController.createOrder);

// Validar params
router.get('/orders/:id', protect, validate(obtenerPedidoPorIdSchema, 'params'), orderController.getOrderById);

// Validar query
router.get('/orders', protect, validate(filtrarPedidosSchema, 'query'), orderController.getOrders);
```

### Respuesta de Errores de Validación

```json
{
  "message": "Errores de validación",
  "errors": [
    "El correo electrónico es un campo obligatorio.",
    "La contraseña debe tener al menos 6 caracteres."
  ]
}
```

---

## 🔐 Autenticación y Autorización

### JWT (JSON Web Tokens)

El sistema usa JWT para autenticación:

1. **Login**: Usuario envía email + password
2. **Token**: Backend genera JWT con datos del usuario
3. **Requests**: Cliente envía token en header `Authorization: Bearer <token>`
4. **Validación**: Middleware `protect` verifica el token

### Middleware `protect`

```javascript
const { protect } = require('../middlewares/auth.middleware');

// Proteger ruta (solo usuarios autenticados)
router.get('/orders', protect, orderController.getMyOrders);
```

---

## 🗄️ Base de Datos (Firestore)

### Colecciones

#### **`clientes`** - Usuarios del Sistema

```javascript
{
  id: "firebase-uid-20-chars",
  email: "usuario@example.com",
  password: "hash-bcrypt",
  nombre: "Juan Pérez",
  telefono: "1234567890",
  direccion: "Calle 123, Ciudad",
  rol: "cliente",
  fechaCreacion: Timestamp,
  fechaActualizacion: Timestamp
}
```

#### **`servicios`** - Servicios del Lavadero

```javascript
{
  id: "service-firebase-id",
  nombre: "Lavado Express",
  descripcion: "Lavado rápido en 24hs",
  modeloDePrecio: "paqueteConAdicional",
  configuracionPrecios: {
    paqueteBase: { nombre: "Básico", precio: 500 },
    adicionales: [
      { nombre: "Planchado", precio: 200 },
      { nombre: "Suavizante", precio: 50 }
    ]
  },
  activo: true,
  imagen: "https://..."
}
```

#### **`pedidos`** - Pedidos de Clientes

```javascript
{
  id: "order-firebase-id",
  clienteId: "cliente-uid",
  servicio: {
    id: "service-id",
    nombre: "Lavado Express"
  },
  detalle: {
    paqueteBase: "Básico",
    adicionales: ["Planchado"]
  },
  observaciones: "Sin suavizante",
  precioEstimado: 700,
  estado: "Recibido",
  fechaCreacion: Timestamp,
  fechaActualizacion: Timestamp
}
```

### Queries Optimizadas

Para evitar índices compuestos innecesarios, las queries ordenan en memoria:

```javascript
// Solo filtrar en Firestore
const snapshot = await db.collection('pedidos')
  .where('clienteId', '==', clienteId)
  .get();

// Ordenar en JavaScript
const pedidos = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .sort((a, b) => b.fechaCreacion - a.fechaCreacion);
```

---

## 🛣️ API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/v1/auth/login` | Iniciar sesión | ❌ |

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/me` | Obtener perfil propio | ✅ |
| PUT | `/api/v1/users/me` | Actualizar perfil | ✅ |
| GET | `/api/v1/users/:id` | Obtener usuario por ID | ✅ Admin |

### Servicios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/servicios` | Listar servicios activos | ❌ |
| GET | `/api/v1/servicios/:id` | Obtener servicio por ID | ❌ |

### Pedidos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/orders` | Crear nuevo pedido | ✅ |
| GET | `/api/v1/orders` | Obtener mis pedidos | ✅ |

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🔧 Variables de Entorno

### Backend (`.env`)

```env
PORT=8080
FIREBASE_PROJECT_ID=laverap-3c51f
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...@laverap-3c51f.iam.gserviceaccount.com
JWT_SECRET=mi-secreto-super-seguro
NODE_ENV=development
```

### Frontend (`.env`)

```env
VITE_API_URL=/api/v1
```

---

## 📦 Scripts Disponibles

### Backend

```bash
npm start        # Iniciar en producción
npm run dev      # Iniciar con nodemon (desarrollo)
npm test         # Ejecutar tests
```

### Frontend

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Preview del build
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👥 Equipo

- **Backend**: Node.js + Express + Firebase
- **Frontend**: React + Vite + TypeScript + shadcn/ui
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication + JWT

