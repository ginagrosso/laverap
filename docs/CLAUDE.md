# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaverApp is a SaaS web application for digitalizing laundry business management. The project uses a monorepo structure with separate backend and frontend applications.

**Team Structure:**
- Victor Teo Risso: Backend (API, Database, Security, Deployment)
- Gina Grosso: Frontend (UI/UX, API Integration, Testing)

## Development Commands

### Backend (Port 8080)
```bash
cd backend
npm install
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture Overview

### Backend Architecture

**Stack:** Node.js + Express + Firebase (Firestore) + JWT

**Layered Architecture:**
```
backend/src/
├── api/
│   ├── routes/        # Route definitions (auth, user, order, service)
│   ├── controllers/   # Request/response handling
│   └── middlewares/   # Auth middleware (protect, authorize)
├── core/
│   └── services/      # Business logic layer (separated from controllers)
├── config/
│   └── firebase.config.js  # Firebase Admin SDK initialization
├── app.js             # Express app setup and route mounting
└── server.js          # Server entry point
```

**Key Patterns:**
- **Service Layer Pattern:** Controllers delegate business logic to service layer (`auth.service.js`, `user.service.js`, `order.service.js`, `service.service.js`)
- **Middleware Chain:** Routes use `protect` (JWT validation) and `authorize(...roles)` (role-based access control)
- **Validation:** Joi schemas in service layer for input validation
- **Database:** Firebase Firestore with collections: `clientes`, `servicios`, `pedidos`

**Authentication Flow:**
1. User credentials → Controller validates presence
2. Service layer validates with Joi schema
3. Service queries Firestore, validates password (bcrypt)
4. JWT token generated (payload: id, email, rol)
5. Controller returns `{ message, data: { usuario, token } }`

**Authorization:**
- `protect` middleware: Validates JWT from `Authorization: Bearer <token>` header, attaches `req.user`
- `authorize(...roles)` middleware: Checks if `req.user.rol` matches allowed roles

**Response Format:** Backend wraps all responses:
- Success: `{ message: string, data: object }` or `{ message: string, usuario: object }`
- Error: `{ message: string }`

### Frontend Architecture

**Stack:** React 18 + TypeScript + Vite + React Router + TanStack Query + shadcn/ui

**Structure:**
```
frontend/src/
├── components/
│   ├── layout/        # Navbar, ProtectedRoute
│   └── ui/            # shadcn/ui components
├── context/
│   └── AuthContext.tsx    # Global auth state (user, token, login, register, logout)
├── lib/
│   ├── api.ts             # API client with fetchApi wrapper
│   └── utils.ts           # Utility functions
├── pages/
│   ├── customer/          # Home, Services, Pricing, CreateOrder, TrackOrder
│   ├── admin/             # Dashboard, Orders, Statistics
│   └── auth/              # Login, Register
├── types/
│   └── index.ts           # TypeScript definitions matching backend contracts
├── App.tsx                # Router setup with role-based protected routes
└── main.tsx               # Entry point with providers
```

**Key Patterns:**
- **Context Pattern:** `AuthContext` manages authentication state globally with localStorage persistence
- **Protected Routes:** `ProtectedRoute` component checks auth + optional role requirements
- **API Client:** Centralized API client in `lib/api.ts` handles Bearer token injection, error handling
- **Type Safety:** TypeScript types in `types/index.ts` match backend response structures exactly

**Role-Based Routing:**
- Public: `/`, `/services`, `/pricing`, `/login`, `/register`
- Protected (any authenticated user): `/order/new`, `/order/track`
- Protected (admin/staff): `/admin/dashboard`, `/admin/orders` (Administrador, Empleado, Dueño)
- Protected (admin only): `/admin/stats` (Administrador, Dueño)

**API Integration:**
- Base URL: `VITE_API_URL` environment variable (default: `http://localhost:8080/api/v1`)
- Auth flow: Login/Register → Store token + user in localStorage → Pass token in `Authorization` header
- Frontend expects response wrapping: Extract `data` or `usuario` fields from backend responses

## Environment Configuration

### Backend (.env)
```
PORT=8080
NODE_ENV=development
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=<from-firebase-service-account>
FIREBASE_PRIVATE_KEY=<from-firebase-service-account>
FIREBASE_CLIENT_EMAIL=<from-firebase-service-account>
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api/v1
```

## API Structure (Backend Routes)

All routes prefixed with `/api/v1`:

**Auth Routes (`/auth`):**
- `POST /auth/register` - Public
- `POST /auth/login` - Public

**User Routes (`/users`):**
- `GET /users/me` - Protected (any authenticated user)
- `GET /users` - Protected (admin only)

**Service Routes (`/servicios`):**
- `GET /servicios` - Public
- `POST /servicios` - Protected (admin only)

**Order Routes (`/orders`):**
- `POST /orders` - Protected (authenticated users)
- `GET /orders` - Protected (returns user's own orders)

## Frontend-Backend Contract

**IMPORTANT:** When consuming backend APIs from frontend:

1. **Response Structure Mismatch:** Backend inconsistently wraps responses:
   - Login: `{ message, data: { usuario, token } }`
   - Register: `{ message, usuario }` (note: `usuario` not nested in `data`)
   - Frontend AuthContext expects: `{ token, user }` at top level

2. **Role Field:** Backend uses `rol` (Spanish), frontend types use `rol` (consistent)

3. **User Roles:** Must match exactly: `"Cliente"`, `"Administrador"`, `"Empleado"`, `"Dueño"`

4. **Auth Headers:** Always send `Authorization: Bearer <token>` for protected routes

## User Roles

- **Cliente** (Customer): Default role for new registrations
- **Administrador** (Administrator): Full access to admin features
- **Empleado** (Employee): Access to dashboard and orders
- **Dueño** (Owner): Access to all admin features including statistics

## Documentation

Comprehensive documentation located in `docs/`:
- `docs/INDEX.md` - Main documentation index
- `docs/SETUP.md` - Detailed setup instructions
- `docs/QUICK_START.md` - Quick start guide
- `docs/FRONTEND_NOTES.md` - Frontend-specific notes
- `docs/IMPLEMENTATION_SUMMARY.md` - Implementation details

## Git Workflow

**Current Branch:** `feature/front-setup`
**Main Branch:** `main`
**Development Branch:** `develop`

When making PRs, typically target the `main` branch unless specified otherwise.