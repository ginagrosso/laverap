# LaverApp Backend API Documentation

**Base URL:** `http://localhost:8080/api/v1` (development)

**Last Updated:** 2025-10-16

## Table of Contents

- [Authentication](#authentication)
- [Response Structure](#response-structure)
- [Endpoints](#endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Service Endpoints](#service-endpoints)
  - [Order Endpoints](#order-endpoints)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Authentication

### Bearer Token Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### How to Get a Token

1. Register a new user at `POST /auth/register` OR
2. Login with existing credentials at `POST /auth/login`
3. Both endpoints return a token in the response
4. Store the token and include it in subsequent requests

### User Roles

The API implements role-based access control with the following roles:

- **Cliente** (Customer) - Default role for new registrations
- **Administrador** (Administrator) - Full admin access
- **Empleado** (Employee) - Staff access to orders and dashboard
- **Dueño** (Owner) - Full owner access including statistics

---

## Response Structure

### Success Responses

**IMPORTANT:** The backend has **inconsistent response wrapping**. Pay attention to each endpoint's specific format.

**Common patterns:**

1. **Most endpoints:**
   ```json
   {
     "message": "Success message",
     "data": { ... }
   }
   ```

2. **Register endpoint (exception):**
   ```json
   {
     "message": "Usuario registrado exitosamente.",
     "usuario": { ... }
   }
   ```
   Note: Uses `usuario` instead of `data`

3. **Login endpoint (nested):**
   ```json
   {
     "message": "Inicio de sesión exitoso.",
     "data": {
       "usuario": { ... },
       "token": "..."
     }
   }
   ```

4. **Get Users (admin only):**
   ```json
   {
     "data": [ ... ]
   }
   ```
   Note: No `message` field

### Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid/missing token, invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Endpoints

### Auth Endpoints

#### POST /auth/register

Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "nombre": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

**Success Response (201):**
```json
{
  "message": "Usuario registrado exitosamente.",
  "usuario": {
    "id": "firestore-document-id",
    "nombre": "John Doe",
    "email": "john@example.com",
    "rol": "cliente"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or validation error
- `500` - Email already registered or server error

**Notes:**
- Email is automatically lowercased
- Password is hashed with bcrypt (salt rounds: 10)
- Default role: `"cliente"`
- ⚠️ **Response uses `usuario` instead of `data`** (inconsistent with other endpoints)

---

#### POST /auth/login

Authenticate user and receive JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "Inicio de sesión exitoso.",
  "data": {
    "usuario": {
      "id": "firestore-document-id",
      "nombre": "John Doe",
      "email": "john@example.com",
      "rol": "cliente"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials (wrong email or password)
- `500` - Internal server error

**JWT Token Details:**
- Payload includes: `{ id, email, rol }`
- Expiration: 1 day (configurable via `JWT_EXPIRES_IN` env var)
- Signed with `JWT_SECRET` from environment

**Notes:**
- Generic error message "Credenciales inválidas" for both invalid email and wrong password (security best practice)
- ⚠️ **Token is nested inside `data` object**, not at top level

---

### User Endpoints

#### GET /users/me

Get current user's profile information.

**Access:** Protected (any authenticated user)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Perfil obtenido exitosamente.",
  "data": {
    "id": "firestore-document-id",
    "nombre": "John Doe",
    "email": "john@example.com",
    "rol": "cliente"
  }
}
```

**Error Responses:**
- `401` - No token provided or invalid token
- `401` - User not found (token valid but user deleted)

**Notes:**
- User data comes from `req.user` (populated by `protect` middleware)
- Password is never returned in the response

---

#### GET /users

Get all users in the system (admin only).

**Access:** Protected (Admin role only)

**Headers:**
```
Authorization: Bearer <token>
```

**Authorization:**
- Requires role: `"admin"`
- Returns `403` if user doesn't have admin role

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "user-id-1",
      "nombre": "John Doe",
      "email": "john@example.com",
      "rol": "cliente",
      "fechaCreacion": "2025-10-16T12:00:00.000Z"
    },
    {
      "id": "user-id-2",
      "nombre": "Jane Admin",
      "email": "jane@example.com",
      "rol": "admin",
      "fechaCreacion": "2025-10-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - No token provided or invalid token
- `403` - User doesn't have admin role
- `500` - Server error

**Notes:**
- ⚠️ **No `message` field in response** (inconsistent with other endpoints)
- Passwords are excluded from all user objects
- Returns empty array `[]` if no users found

---

### Service Endpoints

#### GET /servicios

Get all available laundry services.

**Access:** Public (no authentication required)

**Success Response (200):**
```json
{
  "message": "Se encontraron 3 servicios.",
  "data": [
    {
      "id": "service-id-1",
      "nombre": "Lavado Express",
      "descripcion": "Lavado rápido en 24 horas",
      "modeloDePrecio": "porCanasto",
      "precioPorCanasto": 500,
      "itemsPorCanasto": 10,
      "minimoItems": 5
    },
    {
      "id": "service-id-2",
      "nombre": "Lavado Premium",
      "modeloDePrecio": "porUnidad",
      "precioBase": 100,
      "minimoUnidades": 1,
      "opcionesDePrecio": {
        "tamaño": {
          "pequeño": 0,
          "mediano": 50,
          "grande": 100
        }
      }
    }
  ]
}
```

**Error Responses:**
- `500` - Server error

**Service Pricing Models:**

1. **porCanasto** (Basket-based pricing):
   - `precioPorCanasto`: Price per basket
   - `itemsPorCanasto`: Number of items per basket
   - `minimoItems`: Minimum items required

2. **porUnidad** (Unit-based pricing):
   - `precioBase`: Base price per unit
   - `minimoUnidades`: Minimum units required
   - `opcionesDePrecio`: Optional price variations (object)

3. **paqueteConAdicional** (Package with add-ons):
   - `precioBase`: Base package price
   - `adicionales`: Object with add-on prices (e.g., `{ "planchado": 50 }`)

4. **porOpciones** (Single option selection):
   - `opciones`: Object mapping option names to prices

5. **porOpcionesMultiples** (Multiple options):
   - `precioBase`: Base price
   - `opciones`: Nested object with categories and their price modifiers
   - `minimoUnidades`: Minimum units required

**Notes:**
- Returns empty array with count message if no services found
- Service structure varies based on `modeloDePrecio`

---

#### POST /servicios

Create a new laundry service (admin only).

**Access:** Protected (Admin role only)

**Headers:**
```
Authorization: Bearer <token>
```

**Authorization:**
- Requires role: `"admin"`

**Request Body (porCanasto model):**
```json
{
  "nombre": "Lavado Express",
  "descripcion": "Lavado rápido en 24 horas (optional)",
  "modeloDePrecio": "porCanasto",
  "precioPorCanasto": 500,
  "itemsPorCanasto": 10,
  "minimoItems": 5
}
```

**Request Body (porUnidad model):**
```json
{
  "nombre": "Lavado Premium",
  "modeloDePrecio": "porUnidad",
  "precioBase": 100,
  "minimoUnidades": 1,
  "opcionesDePrecio": {
    "tamaño": {
      "pequeño": 0,
      "mediano": 50,
      "grande": 100
    }
  }
}
```

**Success Response (201):**
```json
{
  "message": "Servicio creado exitosamente.",
  "data": {
    "id": "new-service-id",
    "nombre": "Lavado Express",
    "modeloDePrecio": "porCanasto",
    "precioPorCanasto": 500,
    "itemsPorCanasto": 10,
    "minimoItems": 5
  }
}
```

**Error Responses:**
- `400` - Validation error (missing or invalid fields)
- `401` - No token provided or invalid token
- `403` - User doesn't have admin role

**Validation Rules:**

**For all models:**
- `nombre`: Required, must be string
- `modeloDePrecio`: Required, must be string

**For `porCanasto`:**
- `precioPorCanasto`: Required, must be number
- `itemsPorCanasto`: Required, must be number
- `minimoItems`: Required, must be number

**For `porUnidad`:**
- `precioBase`: Required, must be number
- `minimoUnidades`: Required, must be number
- `opcionesDePrecio`: Optional, object

**Notes:**
- Validation happens in service layer before saving to database
- Invalid `modeloDePrecio` returns validation error

---

### Order Endpoints

#### POST /orders

Create a new order for the authenticated user.

**Access:** Protected (any authenticated user)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (basic structure):**
```json
{
  "servicioId": "firestore-service-id (required)",
  "detalle": {
    // Structure varies by service pricing model
  },
  "observaciones": "Any special instructions (optional)"
}
```

**Request Body Examples by Pricing Model:**

**1. paqueteConAdicional:**
```json
{
  "servicioId": "service-123",
  "detalle": {
    "cantidad": 2,
    "incluyePlanchado": true
  },
  "observaciones": "Por favor, entregar antes de las 5pm"
}
```

**2. porOpcionesMultiples:**
```json
{
  "servicioId": "service-456",
  "detalle": {
    "cantidad": 3,
    "opciones": {
      "tamaño": "grande",
      "tipo": "delicado"
    }
  }
}
```

**3. porOpciones:**
```json
{
  "servicioId": "service-789",
  "detalle": {
    "cantidad": 1,
    "opcion": "express"
  }
}
```

**Success Response (201):**
```json
{
  "message": "Pedido creado exitosamente. Este es un precio estimado y será confirmado en el local.",
  "data": {
    "id": "order-id",
    "clienteId": "user-id",
    "servicio": {
      "id": "service-id",
      "nombre": "Lavado Premium"
    },
    "detalle": {
      "cantidad": 2,
      "incluyePlanchado": true
    },
    "observaciones": "Por favor, entregar antes de las 5pm",
    "precioEstimado": 300,
    "estado": "Recibido",
    "fechaCreacion": "2025-10-16T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing `servicioId` or `detalle`
- `400` - Service doesn't exist
- `400` - Invalid options for the service pricing model
- `400` - Quantity below minimum required
- `401` - No token provided or invalid token

**Order Status Values:**
- `"Recibido"` - Order received (initial state)
- `"En Proceso"` - Order being processed
- `"Listo"` - Order ready for pickup
- `"Entregado"` - Order delivered

**Pricing Calculation:**

The backend calculates `precioEstimado` based on the service's `modeloDePrecio`:

1. **paqueteConAdicional:**
   - Base: `cantidad * precioBase`
   - If `incluyePlanchado`: Add `cantidad * adicionales.planchado`

2. **porOpcionesMultiples:**
   - Start with `precioBase`
   - For each option category, add the modifier value
   - Multiply total by `cantidad`

3. **porOpciones:**
   - Look up price in `opciones[opcion]`
   - Multiply by `cantidad`

**Notes:**
- `clienteId` is automatically extracted from JWT token (`req.user.id`)
- Default `observaciones` is `null` if not provided
- All new orders start with `estado: "Recibido"`
- Price is estimated; actual price may be confirmed at the physical location

---

#### GET /orders

Get all orders for the authenticated user.

**Access:** Protected (any authenticated user)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Se encontraron 2 pedidos.",
  "data": [
    {
      "id": "order-1",
      "clienteId": "user-id",
      "servicio": {
        "id": "service-id",
        "nombre": "Lavado Express"
      },
      "detalle": {
        "cantidad": 1,
        "incluyePlanchado": false
      },
      "observaciones": null,
      "precioEstimado": 150,
      "estado": "Listo",
      "fechaCreacion": "2025-10-15T10:00:00.000Z"
    },
    {
      "id": "order-2",
      "clienteId": "user-id",
      "servicio": {
        "id": "service-id-2",
        "nombre": "Lavado Premium"
      },
      "detalle": {
        "cantidad": 2,
        "opciones": {
          "tamaño": "grande"
        }
      },
      "observaciones": "Entregar mañana",
      "precioEstimado": 400,
      "estado": "En Proceso",
      "fechaCreacion": "2025-10-16T08:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - No token provided or invalid token
- `500` - Server error

**Notes:**
- Only returns orders for the authenticated user (`clienteId` matches `req.user.id`)
- Orders are sorted by `fechaCreacion` in descending order (newest first)
- Returns empty array with count message if user has no orders

---

## Data Models

### User Object

```typescript
{
  id: string;              // Firestore document ID
  nombre: string;          // User's full name
  email: string;           // Lowercase email
  rol: UserRole;           // "cliente" | "admin" | "Administrador" | "Empleado" | "Dueño"
  fechaCreacion?: Date;    // Account creation timestamp
  telefono?: string;       // Optional phone number
  // password is NEVER returned in responses
}
```

### Service Object

```typescript
{
  id: string;
  nombre: string;
  descripcion?: string;
  modeloDePrecio: "porCanasto" | "porUnidad" | "paqueteConAdicional" | "porOpciones" | "porOpcionesMultiples";

  // Fields vary by pricing model:

  // For porCanasto:
  precioPorCanasto?: number;
  itemsPorCanasto?: number;
  minimoItems?: number;

  // For porUnidad:
  precioBase?: number;
  minimoUnidades?: number;
  opcionesDePrecio?: Record<string, Record<string, number>>;

  // For paqueteConAdicional:
  precioBase?: number;
  adicionales?: Record<string, number>;  // e.g., { "planchado": 50 }

  // For porOpciones:
  opciones?: Record<string, number>;     // e.g., { "express": 200, "normal": 100 }

  // For porOpcionesMultiples:
  precioBase?: number;
  opciones?: Record<string, Record<string, number>>;
  minimoUnidades?: number;
}
```

### Order Object

```typescript
{
  id: string;
  clienteId: string;
  servicio: {
    id: string;
    nombre: string;
  };
  detalle: OrderDetail;    // Structure varies by service pricing model
  observaciones: string | null;
  precioEstimado: number;
  estado: "Recibido" | "En Proceso" | "Listo" | "Entregado";
  fechaCreacion: Date;
}
```

### Order Detail Structures

```typescript
// For paqueteConAdicional:
{
  cantidad: number;
  incluyePlanchado?: boolean;
}

// For porOpcionesMultiples:
{
  cantidad: number;
  opciones: Record<string, string>;  // e.g., { "tamaño": "grande", "tipo": "delicado" }
}

// For porOpciones:
{
  cantidad: number;
  opcion: string;  // e.g., "express"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Todos los campos son obligatorios."
}
```

**Common causes:**
- Missing required fields
- Invalid field types
- Validation errors
- Business logic errors (e.g., minimum quantity not met)

### 401 Unauthorized

```json
{
  "message": "No autorizado, no se proporcionó un token."
}
```

**Or:**

```json
{
  "message": "No autorizado, token inválido."
}
```

**Or:**

```json
{
  "message": "No se encontró el usuario de este token."
}
```

**Common causes:**
- No Authorization header
- Malformed token
- Expired token
- Invalid signature
- User deleted but token still valid

### 403 Forbidden

```json
{
  "message": "No tienes permiso para realizar esta acción."
}
```

**Cause:**
- User's role doesn't match required role(s) for the endpoint

### 500 Internal Server Error

```json
{
  "message": "Error interno del servidor."
}
```

**Cause:**
- Unexpected server errors
- Database connection issues
- Unhandled exceptions

---

## Frontend Integration Notes

### Response Inconsistencies to Handle

1. **Register endpoint:**
   - Returns `{ message, usuario }` instead of `{ message, data }`
   - Frontend needs to map `usuario` to expected `user` field

2. **Login endpoint:**
   - Returns `{ message, data: { usuario, token } }`
   - Frontend AuthContext expects `{ token, user }` at top level
   - Need to extract from nested structure

3. **Get Users (admin):**
   - Returns `{ data }` with no `message` field
   - All other endpoints include `message`

### Authentication Flow

```typescript
// 1. Login
const loginResponse = await api.post('/auth/login', { email, password });
// Response: { message, data: { usuario, token } }

// 2. Extract token and user
const { token, usuario: user } = loginResponse.data;

// 3. Store in localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// 4. Use token in subsequent requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Type Definitions Compatibility

The frontend `types/index.ts` mostly aligns with backend, but note:

- Frontend uses `UserRole = "Cliente" | "Administrador" | "Empleado" | "Dueño"`
- Backend stores exactly these Spanish role names
- Frontend `AuthResponse` expects `{ token, user }` but needs adaptation for backend responses

---

## Environment Variables Required

### Backend (.env)

```bash
PORT=8080
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Profile:**
```bash
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Services:**
```bash
curl http://localhost:8080/api/v1/servicios
```

**Create Order:**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"servicioId":"service-id","detalle":{"cantidad":1},"observaciones":"Test order"}'
```

---

## Security Considerations

1. **Password Security:**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Passwords never returned in API responses

2. **JWT Security:**
   - Tokens expire after configured time (default 1 day)
   - Signed with secret key from environment
   - Payload: `{ id, email, rol }`

3. **Role-Based Access:**
   - Protected routes verify token validity
   - Admin routes verify user role
   - Middleware chain: `protect` → `authorize(...roles)`

4. **Input Validation:**
   - Joi schemas validate auth requests
   - Service creation validates required fields per pricing model
   - Order creation validates service existence and options

5. **Error Messages:**
   - Generic "Credenciales inválidas" prevents user enumeration
   - Detailed validation errors for debugging

---

## Changelog

### 2025-10-16
- Initial API documentation created
- Documented all 8 endpoints
- Noted response structure inconsistencies
- Added frontend integration notes
