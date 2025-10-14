# LAVERAPP - Documentación Completa del Proyecto

**Última Actualización:** 14 de Octubre, 2025

---

## Tabla de Contenidos

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Tech Stack y Arquitectura](#tech-stack-y-arquitectura)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Guía de Inicio Rápido](#guía-de-inicio-rápido)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Gestión de Usuarios y Roles](#gestión-de-usuarios-y-roles)
7. [Flujo de Pedidos](#flujo-de-pedidos)
8. [Modelos de Precios](#modelos-de-precios)
9. [Implementación del Frontend](#implementación-del-frontend)
10. [Backend: Contratos y Endpoints](#backend-contratos-y-endpoints)
11. [Notas de Desarrollo](#notas-de-desarrollo)
12. [Despliegue](#despliegue)
13. [Troubleshooting](#troubleshooting)

---

# Contexto del Proyecto

## 1. Visión General

* **Proyecto:** LAVERAPP, un SaaS web para digitalizar la gestión de una lavandería local llamada "Laverap"
* **Alumnos y Roles**:
    * **Risso, Victor Teo:** Backend (API REST, Base de Datos, Seguridad, Despliegue)
    * **Grosso, Gina:** Frontend (UI/UX, Next.js, Consumo de API, Testing e2e)
* **Problema a Resolver:** La gestión manual actual provoca falta de trazabilidad, errores operativos y demoras, afectando la satisfacción del cliente
* **Solución Propuesta:** Un sistema que gestiona todo el ciclo de vida del servicio: solicitud, pago, seguimiento en tiempo real y entrega

## 2. Actores del Sistema

* **Cliente:** Crea pedidos, sigue su estado y realiza pagos
* **Empleado/Operario:** Actualiza el estado de los lavados
* **Administrador:** Gestiona el catálogo de servicios, precios y supervisa los pedidos
* **Dueño:** Analiza reportes de rendimiento del negocio

## 3. Requerimientos Funcionales Clave (RF)

* **RF1 - Usuarios & Autenticación:** Registro/login, perfiles y permisos por rol (Cliente, Admin/Operario)
* **RF2 - Catálogo & Precios:** El administrador puede gestionar servicios y sus tarifas (por kg/prenda)
* **RF3 - Pedidos (Cliente):** El cliente crea un pedido, recibe un precio estimado y un comprobante digital
* **RF4 - Seguimiento & Notificaciones:** El estado del pedido es visible en tiempo real (`Recibido` -> `En Proceso` -> `Listo` -> `Entregado`). Se envían notificaciones al cliente
* **RF5 - Pagos:** Registro de pagos en el local (efectivo/transferencia) y control de saldos pendientes
* **RF6 - Panel Operativo:** Un tablero para que el personal gestione los pedidos, actualice estados y registre incidencias
* **RF7 - Reportes:** Dashboard con métricas de negocio (volumen, ingresos, tiempos)

## 4. Historias de Usuario Prioritarias (MVP)

* **HU1: Crear Pedido:** "Como cliente, quiero crear un pedido con servicios y cantidad para conocer el precio estimado y obtener un comprobante"
* **HU2: Actualizar Estado:** "Como administrador, quiero actualizar el estado del pedido y notificar al cliente para mantener la trazabilidad"
* **HU3: Registrar Pagos:** "Como administrador, quiero registrar pagos en el local y emitir un comprobante para cerrar la venta"

---

# Tech Stack y Arquitectura

## Pila Tecnológica

### Backend
- **Runtime:** Node.js con Express
- **Database:** Firebase Firestore (colecciones: `clientes`, `pedidos`, `servicios`, `pagos`, `auditoria`)
- **Authentication:** JWT con Role-Based Access Control (RBAC)
- **Module System:** CommonJS (`require`/`module.exports`)
- **Language:** JavaScript

### Frontend
- **Framework:** React con Vite
- **Language:** TypeScript
- **UI Library:** Shadcn/ui components (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form con Zod validation

### Deployment
- Backend: Render
- Frontend: Vercel

## Arquitectura General

El sistema sigue una arquitectura cliente-servidor. Un **Frontend** (React + Vite) se comunica vía **HTTPS** con una **API REST Backend** (Node.js/Express). El backend, a su vez, gestiona la lógica de negocio y persiste los datos en una base de datos **Firebase Firestore** en la nube. Se integra con servicios externos para el envío de **Notificaciones**.

### Backend Structure
```
backend/src/
├── api/
│   ├── controllers/     # Request handlers (auth, user, order, service)
│   ├── middlewares/     # Auth middleware (protect, authorize)
│   └── routes/          # Route definitions
├── core/
│   └── services/        # Business logic layer
├── config/
│   └── firebase.config.js  # Firebase Admin SDK initialization
├── app.js               # Express app setup and route mounting
└── server.js            # Server entry point
```

**Architecture Pattern:** Classic MVC-style with clear separation:
- **Routes** → **Controllers** → **Services** → **Firestore**
- All routes are mounted under `/api/v1` prefix
- Authentication uses JWT tokens passed as `Bearer` tokens in Authorization header

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/              # Shadcn/ui components (button, card, dialog, etc.)
│   ├── layout/          # Layout components (Header, Footer, Navbar)
│   ├── customer/        # Customer-facing components
│   └── admin/           # Admin-specific components
├── pages/
│   ├── customer/        # Customer pages
│   ├── admin/           # Admin pages
│   └── auth/            # Auth pages
├── context/
│   └── AuthContext.tsx  # Authentication context provider
├── hooks/               # Custom React hooks
├── lib/
│   ├── api.ts           # API client configuration
│   └── utils.ts         # Utility functions (cn, etc.)
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # App setup with providers and routing
└── main.tsx             # React entry point
```

**Key Patterns:**
- Path aliasing: `@/` resolves to `src/`
- All pages render component compositions from the components directory
- UI components follow Shadcn/ui patterns with className composition via `tailwind-merge`

---

# Configuración del Entorno

## Port Configuration

**IMPORTANTE:** Configuración de puertos:
- **Backend:** Port 8080
- **Frontend:** Port 5173

Ambos pueden correr simultáneamente sin conflictos.

## Initial Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# The .env file is already configured with Firebase credentials
# Verify it exists:
ls -la .env

# Start the backend
npm run dev
```

Backend estará disponible en: `http://localhost:8080`

**Backend .env contiene:**
```
PORT=8080
NODE_ENV=development
JWT_SECRET=<your-secure-secret>
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=laverap-3c51f
FIREBASE_PRIVATE_KEY=<firebase-private-key>
FIREBASE_CLIENT_EMAIL=<firebase-client-email>
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# The .env file is already configured with backend URL
# Verify it exists:
ls -la .env

# Start the frontend
npm run dev
```

Frontend estará disponible en: `http://localhost:5173`

**Frontend .env contiene:**
```
VITE_API_URL=http://localhost:8080/api/v1
```

## Environment Files Security

✅ Ambos archivos `.env` están en **gitignore** y NO se commitearán al control de versiones.

**Backend `.gitignore`** incluye:
```
.env
```

**Frontend `.gitignore`** incluye:
```
.env
.env.local
.env.*.local
```

---

# Guía de Inicio Rápido

## Running the App

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Deberías ver:
```
Servidor escuchando en el puerto 8080
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE v5.4.19  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Development Commands

### Backend (from `/backend`)
```bash
npm run dev      # Start development server with nodemon (port 8080)
npm start        # Start production server
```

**Backend URL:** `http://localhost:8080`

### Frontend (from `/frontend`)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run build:dev # Development mode build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Frontend URL:** `http://localhost:5173`

## Verification

1. **Backend Health Check:**
   - Visit: `http://localhost:8080/api/v1/servicios` (should return services data)

2. **Frontend:**
   - Visit: `http://localhost:5173` (should show landing page)
   - Try registering a new account
   - Try logging in
   - Navigate between pages

## Available Routes

### Public Routes (No Login Required)
- `/` - Home page with hero and info
- `/services` - Service catalog
- `/pricing` - Pricing information
- `/login` - Login page
- `/register` - Registration page

### Customer Routes (Login Required)
- `/order/new` - Create new order
- `/order/track` - View my orders

### Admin Routes (Admin Roles Only)
- `/admin/dashboard` - Admin overview
- `/admin/orders` - Manage orders (Administrador, Empleado, Dueño)
- `/admin/stats` - Statistics (Administrador, Dueño)

---

# Estructura del Proyecto

## Routing Structure

```
/ (public)
  ├─ /                  Customer landing page
  ├─ /services          Service catalog
  ├─ /pricing           Pricing information
  ├─ /order/new         Create new order (requires auth)
  ├─ /order/track       Track order status (requires auth)
  ├─ /login             Login page
  └─ /register          Registration page

/admin (protected, admin roles only)
  ├─ /admin/dashboard   Main admin dashboard
  ├─ /admin/orders      Operational panel (order management)
  └─ /admin/stats       Statistics & reports
```

## Component Organization

```
src/
├── components/
│   ├── layout/           Layout components (Header, Footer, Navbar)
│   ├── customer/         Customer-facing components
│   ├── admin/            Admin-specific components
│   ├── auth/             Auth-related components (LoginForm, RegisterForm)
│   └── ui/               Shadcn/ui primitives
├── pages/
│   ├── customer/         Customer pages
│   ├── admin/            Admin pages
│   └── auth/             Auth pages
├── context/
│   └── AuthContext.tsx   Authentication context provider
├── hooks/
│   ├── useAuth.ts        Auth hook
│   └── useOrders.ts      Orders data fetching hook
├── lib/
│   ├── api.ts            API client configuration
│   └── utils.ts          Utility functions
└── types/
    └── index.ts          TypeScript type definitions
```

---

# Gestión de Usuarios y Roles

## User Roles & Permissions

El sistema soporta control de acceso basado en roles con estos actores:
- **Cliente (Customer):** Creates orders, tracks status, makes payments
- **Empleado/Operario (Employee):** Updates order states
- **Administrador (Admin):** Manages service catalog, prices, supervises orders
- **Dueño (Owner):** Analyzes business performance reports

## Authentication Flow

1. User registers via `POST /api/v1/auth/register`
2. User logs in via `POST /api/v1/auth/login` → receives JWT token
3. Protected routes require `Authorization: Bearer <token>` header
4. `protect` middleware verifies token and attaches user to `req.user`
5. `authorize(...roles)` middleware checks if `req.user.rol` matches allowed roles

## Testing the Flow

### As a Customer:
1. Visit `/` (home page)
2. Click "Registrarse" → fill form → auto-login
3. Navigate to "Crear Pedido" → order form appears
4. Navigate to "Mis Pedidos" → see order tracking
5. Try to access `/admin/dashboard` → denied (403)

### As an Admin:
1. Login with admin credentials
2. See "Admin" button in navbar
3. Access `/admin/dashboard` → see metrics
4. Access `/admin/orders` → operational panel
5. Access `/admin/stats` → charts and reports

---

# Flujo de Pedidos

## Order States Flow

`Recibido` → `En Proceso` → `Listo` → `Entregado`

El estado del pedido es visible en tiempo real y se actualizan por el personal de la lavandería.

---

# Modelos de Precios

El sistema soporta dos modelos de precios configurados por servicio:

## 1. Por Canasto (`porCanasto`)

- Calcula basado en número de items con umbral mínimo
- Regla especial: sábanas de 2 plazas cuentan como 2 items
- Fórmula: `canastos = ceil(totalItems / (itemsPorCanasto / 2)) * 0.5`
- Precio: `canastos * precioPorCanasto`

## 2. Por Unidad (`porUnidad`)

- Precio base con opciones adicionales desde categorías de `opcionesDePrecio`
- Requiere cantidad mínima de unidades
- Fórmula: `cantidad * (precioBase + opciones)`

Esta lógica de precios está implementada en `backend/src/core/services/order.service.js:16-54`.

---

# Implementación del Frontend

## Estado de Implementación

### Phase 1: Navigation & Routing ✅ COMPLETED
- Multi-view routing structure with React Router
- Customer navigation (Home, Services, Pricing, Place Order, Track Order)
- Admin navigation (Dashboard, Orders Panel, Statistics)
- Protected routes for admin-only views
- Responsive navigation header/menu (desktop + mobile)

### Phase 2: Authentication & User Management ✅ COMPLETED
- Login/Register forms
- JWT token storage (localStorage)
- Auth context provider with hooks
- Role-based access control (Cliente, Administrador, Empleado, Dueño)
- Logout functionality
- Protected route wrapper component with role verification

### Phase 3: Customer Features (Using Mock Data - Backend Integration Pending)
- Service catalog view (mock data, ready for API integration)
- Order creation form (EstimatorForm reused, needs API integration)
- Order tracking/status view (mock data, ready for API integration)
- Price estimation calculator (mock, needs backend pricing logic)
- Order receipt/confirmation display
- **TODO:** Replace mock data with actual API calls to backend

### Phase 4: Admin Features (Using Mock Data - Backend Integration Pending)
- Operational panel (OperationalPanel reused, needs API integration)
- Order status updates (waiting for backend PATCH endpoint)
- Statistics dashboard with charts (mock data)
- Service catalog management (waiting for backend CRUD endpoints)
- Payment registration (waiting for backend endpoint)

## Layout Components

### Navbar
Responsive header with role-based menu items:
- Desktop: Dropdown menu for user actions
- Mobile: Sheet (slide-out) menu
- Shows admin link only for authorized roles

### ProtectedRoute
HOC for route protection with loading states

### Footer
Reused from existing landing page

## State Management
- **Auth State:** React Context (user, token, role, login/logout methods)
- **Server State:** TanStack Query (React Query) for API data fetching/caching
- **Form State:** React Hook Form + Zod validation

## Security Considerations
- Store JWT in `localStorage` (simple, accepted risk for MVP)
- Clear token on logout
- Redirect to login on 401 responses
- Role checks on protected routes
- Admin routes require role verification

---

# Backend: Contratos y Endpoints

## Authentication (from `/api/v1/auth`)

### POST /register
Creates new user account
- **Body:** `{ email, password, nombre, telefono, rol? }`
- **Returns:** User object + JWT token

### POST /login
Authenticates user
- **Body:** `{ email, password }`
- **Returns:** `{ token, user }`

### Token format
`Bearer <JWT>` in Authorization header

### Roles
"Cliente", "Administrador", "Empleado", "Dueño"

## Orders (from `/api/v1/orders`)

### POST /
Create new order (requires auth)
- **Body:** `{ servicioId, detalle, observaciones }`
- `detalle` varies by service pricing model:
  - **porCanasto:** `{ cantidadPrendasNormales, cantidadSabanas2Plazas }`
  - **porUnidad:** `{ cantidad, opciones }`
- **Returns:** Order with `precioEstimado` and auto-assigned `estado: "Recibido"`

### GET /
Get all orders for logged-in user (requires auth)
- **Returns:** Array of orders sorted by `fechaCreacion` desc

## Services (from `/api/v1/servicios`)

### GET /
List all services
- **Returns:** Array of services
- Service pricing models:
  - **porCanasto:** Fixed price per basket with minimum items threshold
  - **porUnidad:** Base price + optional add-ons from `opcionesDePrecio`

## TODO: Backend Clarifications Needed

1. **Order Updates:** What endpoint updates order status? (Admin/Employee only)
2. **Service Management:** CRUD endpoints for services? (Admin only)
3. **Payment Registration:** Endpoint for recording payments?
4. **User Profile:** GET/PATCH endpoints for user profile management?
5. **Service Listing:** Is `/api/v1/servicios GET` public or requires auth?
6. **Notifications:** How are notifications triggered/delivered?
7. **Admin Permissions:** Which roles can update order status? (Administrador + Empleado?)

---

# Notas de Desarrollo

## Key Implementation Notes

- Backend uses CommonJS modules, not ES6 modules
- Frontend uses absolute imports with `@/` prefix via Vite path aliasing
- The contexto.md document mentions Next.js but the actual implementation uses Vite + React
- All API routes are prefixed with `/api/v1/`
- Firestore collection names are in Spanish: `clientes`, `pedidos`, `servicios`, `pagos`, `auditoria`
- The auth middleware looks up users in the `clientes` collection

## Firebase Configuration

The backend uses Firebase Admin SDK initialized in `backend/src/config/firebase.config.js`. Credentials come from environment variables, not a JSON file.

## Date Formatting
- Backend returns Firestore timestamps
- Frontend should use `date-fns` for formatting (already in dependencies)

## Error Handling
- Use `sonner` toast for user-facing errors
- Display validation errors inline with forms
- Generic error boundary for unexpected failures

## Responsive Design
- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Admin panel should be desktop-optimized but functional on mobile

## Mock Data Locations

Currently using mock data (replace with API calls later):
- `src/pages/customer/Services.tsx` - mockServices
- `src/pages/customer/TrackOrder.tsx` - mockOrders
- `src/pages/admin/Dashboard.tsx` - mockStats
- `src/pages/admin/Statistics.tsx` - mockRevenueData, mockServiceData
- `src/components/OperationalPanel.tsx` - mockOrders
- `src/components/EstimatorForm.tsx` - PRICES constant

---

# Despliegue

## Production Deployment

### Backend (Render)

1. Push code to repository
2. In Render, add environment variables from `backend/.env`
3. Set build command: `npm install`
4. Set start command: `npm start`

### Frontend (Vercel)

1. Push code to repository
2. In Vercel, set environment variable:
   - `VITE_API_URL=https://your-backend-url.render.com/api/v1`
3. Build command: `npm run build`
4. Output directory: `dist`

---

# Troubleshooting

## Port Already in Use

### Backend (8080):
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process if needed
kill -9 <PID>
```

### Frontend (5173):
```bash
# Check what's using port 5173
lsof -i :5173

# Kill the process if needed
kill -9 <PID>
```

## Backend Won't Start

1. Verify Node.js is installed: `node --version`
2. Check if dependencies are installed: `ls backend/node_modules`
3. If not, run: `cd backend && npm install`
4. Check `.env` file exists: `ls backend/.env`

## Frontend Won't Start

1. Verify Node.js is installed: `node --version`
2. Check if dependencies are installed: `ls frontend/node_modules`
3. If not, run: `cd frontend && npm install`
4. Check `.env` file exists: `ls frontend/.env`

## Firebase Errors

If you see Firebase authentication errors:
1. Verify `FIREBASE_PROJECT_ID` in backend `.env`
2. Verify `FIREBASE_PRIVATE_KEY` is properly formatted (with newlines as `\n`)
3. Verify `FIREBASE_CLIENT_EMAIL` is correct

## Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:8080/api/v1/servicios`
2. Check frontend .env: `cat frontend/.env`
3. Should show: `VITE_API_URL=http://localhost:8080/api/v1`

---

# Quick Reference

## Ports & URLs

| Service  | Port | URL                        | Command        |
|----------|------|----------------------------|----------------|
| Backend  | 8080 | http://localhost:8080      | `npm run dev`  |
| Frontend | 5173 | http://localhost:5173      | `npm run dev`  |

**API Base URL:** `http://localhost:8080/api/v1`

## Key Files to Know

### Authentication
- `src/context/AuthContext.tsx` - Auth state management
- `src/pages/auth/Login.tsx` - Login form
- `src/pages/auth/Register.tsx` - Registration form

### API Integration
- `src/lib/api.ts` - API client utilities
- `src/types/index.ts` - TypeScript types

### Routing
- `src/App.tsx` - Route definitions
- `src/components/layout/ProtectedRoute.tsx` - Route guards
- `src/components/layout/Navbar.tsx` - Navigation

---

**Fin de la Documentación**
