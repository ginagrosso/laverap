# Frontend Development Notes - LAVERAPP

**Last Updated:** 2025-10-09

## Overview
This document tracks frontend features, architecture decisions, and assumptions based on backend contracts.

---

## Implementation Status

### Phase 1: Navigation & Routing ✅ COMPLETED
- [x] Multi-view routing structure with React Router
- [x] Customer navigation (Home, Services, Pricing, Place Order, Track Order)
- [x] Admin navigation (Dashboard, Orders Panel, Statistics)
- [x] Protected routes for admin-only views
- [x] Responsive navigation header/menu (desktop + mobile)

### Phase 2: Authentication & User Management ✅ COMPLETED
- [x] Login/Register forms
- [x] JWT token storage (localStorage)
- [x] Auth context provider with hooks
- [x] Role-based access control (Cliente, Administrador, Empleado, Dueño)
- [x] Logout functionality
- [x] Protected route wrapper component with role verification

### Phase 3: Customer Features (Using Mock Data - Backend Integration Pending)
- [x] Service catalog view (mock data, ready for API integration)
- [x] Order creation form (EstimatorForm reused, needs API integration)
- [x] Order tracking/status view (mock data, ready for API integration)
- [x] Price estimation calculator (mock, needs backend pricing logic)
- [x] Order receipt/confirmation display
- [ ] **TODO:** Replace mock data with actual API calls to backend

### Phase 4: Admin Features (Using Mock Data - Backend Integration Pending)
- [x] Operational panel (OperationalPanel reused, needs API integration)
- [ ] Order status updates (waiting for backend PATCH endpoint)
- [x] Statistics dashboard with charts (mock data)
- [ ] Service catalog management (waiting for backend CRUD endpoints)
- [ ] Payment registration (waiting for backend endpoint)

---

## Backend Contract Assumptions

### Authentication (from `/api/v1/auth`)
- **POST /register**: Creates new user account
  - Body: `{ email, password, nombre, telefono, rol? }`
  - Returns: User object + JWT token
- **POST /login**: Authenticates user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
- **Token format**: `Bearer <JWT>` in Authorization header
- **Roles**: "Cliente", "Administrador", "Empleado", "Dueño"

### Orders (from `/api/v1/orders`)
- **POST /**: Create new order (requires auth)
  - Body: `{ servicioId, detalle, observaciones }`
  - `detalle` varies by service pricing model:
    - **porCanasto**: `{ cantidadPrendasNormales, cantidadSabanas2Plazas }`
    - **porUnidad**: `{ cantidad, opciones }`
  - Returns: Order with `precioEstimado` and auto-assigned `estado: "Recibido"`

- **GET /**: Get all orders for logged-in user (requires auth)
  - Returns: Array of orders sorted by `fechaCreacion` desc

### Order States (from backend logic)
State flow: `Recibido` → `En Proceso` → `Listo` → `Entregado`

### Services (from `/api/v1/servicios`)
- **GET /**: List all services (TODO: confirm if auth required)
- Service pricing models:
  - **porCanasto**: Fixed price per basket with minimum items threshold
  - **porUnidad**: Base price + optional add-ons from `opcionesDePrecio`

### Users (from `/api/v1/users`)
- TODO: Confirm available endpoints (likely GET /profile, PATCH /profile, etc.)

---

## TODO: Backend Clarifications Needed

1. **Order Updates**: What endpoint updates order status? (Admin/Employee only)
2. **Service Management**: CRUD endpoints for services? (Admin only)
3. **Payment Registration**: Endpoint for recording payments?
4. **User Profile**: GET/PATCH endpoints for user profile management?
5. **Service Listing**: Is `/api/v1/servicios GET` public or requires auth?
6. **Notifications**: How are notifications triggered/delivered?
7. **Admin Permissions**: Which roles can update order status? (Administrador + Empleado?)

---

## Architecture Decisions

### Routing Structure
```
/ (public)
  ├─ /home              Customer landing page
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

### State Management
- **Auth State**: React Context (user, token, role, login/logout methods)
- **Server State**: TanStack Query (React Query) for API data fetching/caching
- **Form State**: React Hook Form + Zod validation

### Component Organization
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

### Security Considerations
- Store JWT in `localStorage` (simple, accepted risk for MVP)
- Clear token on logout
- Redirect to login on 401 responses
- Role checks on protected routes
- Admin routes require role verification

---

## Current Component Inventory

### Existing Components (from landing page)
- **Hero**: Landing hero section with CTA
- **EstimatorForm**: Order estimation form (demo, needs backend integration)
- **HowItWorks**: Info section about process
- **OrderStatus**: Demo order tracking component
- **PaymentDemo**: Demo payment flow
- **OperationalPanel**: Admin panel preview (needs to become real admin page)
- **FAQ**: Frequently asked questions
- **Footer**: Site footer

### Reuse Strategy
- Move `OperationalPanel` to admin section
- Convert `EstimatorForm` to real order creation form
- Convert `OrderStatus` to real order tracking page
- Keep `Hero`, `HowItWorks`, `FAQ`, `Footer` for public landing page

---

## Notes & Conventions

### API Base URL
- Development: `http://localhost:3000/api/v1` (backend default port)
- Production: TBD (Render deployment URL)

### Date Formatting
- Backend returns Firestore timestamps
- Frontend should use `date-fns` for formatting (already in dependencies)

### Error Handling
- Use `sonner` toast for user-facing errors
- Display validation errors inline with forms
- Generic error boundary for unexpected failures

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Admin panel should be desktop-optimized but functional on mobile

---

## Development Workflow

1. Build page structure with mock data
2. Create TypeScript types based on backend contracts
3. Implement API client functions
4. Replace mock data with React Query hooks
5. Add error handling and loading states
6. Test with backend (when available)
7. Refine based on actual API responses
