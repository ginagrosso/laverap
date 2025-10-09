# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LAVERAPP is a SaaS web application for digitalizing the management of a local laundry business called "Laverap". This is a university thesis project (TFI-TUP 2025) with the following team:
- **Victor Teo Risso:** Backend (REST API, Database, Security, Deployment)
- **Gina Grosso:** Frontend (UI/UX, Next.js, API Consumption, e2e Testing)

The system manages the complete service lifecycle: order creation, payment processing, real-time tracking, and delivery.

## Tech Stack

### Backend
- **Runtime:** Node.js with Express
- **Database:** Firebase Firestore (collections: `clientes`, `pedidos`, `servicios`, `pagos`, `auditoria`)
- **Authentication:** JWT with Role-Based Access Control (RBAC)
- **Module System:** CommonJS (`require`/`module.exports`)
- **Language:** JavaScript

### Frontend
- **Framework:** React with Vite (not Next.js, despite contexto.md mentioning it)
- **Language:** TypeScript
- **UI Library:** Shadcn/ui components (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form with Zod validation

### Deployment
- Backend: Render
- Frontend: Vercel

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

**Note:** Ports are configured to avoid conflicts - backend uses 8080, frontend uses 5173.

## Architecture

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
│   └── *.tsx            # Feature components (Hero, EstimatorForm, etc.)
├── pages/
│   ├── Index.tsx        # Main landing page
│   └── NotFound.tsx     # 404 page
├── hooks/               # Custom React hooks
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── App.tsx              # App setup with providers and routing
└── main.tsx             # React entry point
```

**Key Patterns:**
- Path aliasing: `@/` resolves to `src/`
- All pages render component compositions from the components directory
- UI components follow Shadcn/ui patterns with className composition via `tailwind-merge`

## User Roles & Permissions

The system supports role-based access control with these actors:
- **Cliente (Customer):** Creates orders, tracks status, makes payments
- **Empleado/Operario (Employee):** Updates order states
- **Administrador (Admin):** Manages service catalog, prices, supervises orders
- **Dueño (Owner):** Analyzes business performance reports

## Order Management

### Order States Flow
`Recibido` → `En Proceso` → `Listo` → `Entregado`

### Pricing Models
The system supports two pricing models configured per service:

1. **`porCanasto` (by basket):**
   - Calculates based on number of items with minimum threshold
   - Special rule: 2-plaza sheets count as 2 items
   - Formula: `canastos = ceil(totalItems / (itemsPorCanasto / 2)) * 0.5`
   - Price: `canastos * precioPorCanasto`

2. **`porUnidad` (by unit):**
   - Base price with optional add-ons from `opcionesDePrecio` categories
   - Requires minimum unit quantity
   - Formula: `cantidad * (precioBase + opciones)`

This pricing logic is implemented in [backend/src/core/services/order.service.js](backend/src/core/services/order.service.js:16-54).

## Authentication Flow

1. User registers via `POST /api/v1/auth/register`
2. User logs in via `POST /api/v1/auth/login` → receives JWT token
3. Protected routes require `Authorization: Bearer <token>` header
4. `protect` middleware verifies token and attaches user to `req.user`
5. `authorize(...roles)` middleware checks if `req.user.rol` matches allowed roles

## Environment Setup

### Backend Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:
```bash
PORT=8080
NODE_ENV=development
JWT_SECRET=<your-secure-secret>
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_PRIVATE_KEY=<firebase-private-key>
FIREBASE_CLIENT_EMAIL=<firebase-client-email>
```

### Firebase Configuration
The backend uses Firebase Admin SDK initialized in [backend/src/config/firebase.config.js](backend/src/config/firebase.config.js). Credentials come from environment variables, not a JSON file.

## Key Implementation Notes

- Backend uses CommonJS modules, not ES6 modules (despite `"type": "commonjs"` being explicit)
- Frontend uses absolute imports with `@/` prefix via Vite path aliasing
- The contexto.md document mentions Next.js but the actual implementation uses Vite + React
- All API routes are prefixed with `/api/v1/`
- Firestore collection names are in Spanish: `clientes`, `pedidos`, `servicios`, `pagos`, `auditoria`
- The auth middleware looks up users in the `clientes` collection
