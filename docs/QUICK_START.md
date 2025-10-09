# Quick Start Guide - Laverapp Frontend

## Running the App

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

**Note:** Backend runs on port 8080, frontend runs on port 5173

---

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

## User Roles

1. **Cliente** - Can create and track orders
2. **Administrador** - Full admin access
3. **Empleado** - Can manage orders
4. **Dueño** - Full access including statistics

---

## Development Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## Environment Variables

The `.env` file is already created with the correct configuration:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

**Important:** The `.env` file is gitignored and should never be committed to version control.

---

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

### Customer Pages
- `src/pages/customer/Home.tsx`
- `src/pages/customer/Services.tsx`
- `src/pages/customer/Pricing.tsx`
- `src/pages/customer/CreateOrder.tsx`
- `src/pages/customer/TrackOrder.tsx`

### Admin Pages
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Orders.tsx`
- `src/pages/admin/Statistics.tsx`

---

## Testing the App

### Test Customer Flow:
1. Visit `/register`
2. Create account with email/password
3. Auto-redirected to home (logged in)
4. Click "Crear Pedido" in navbar
5. Fill order form (currently mock)
6. Click "Mis Pedidos" to see tracking

### Test Admin Flow:
1. Login with admin credentials
2. See "Admin" button in navbar
3. Click to access `/admin/dashboard`
4. Navigate between Dashboard, Orders, Stats

### Test Protection:
1. Logout
2. Try accessing `/order/new` → redirected to login
3. Login as regular user
4. Try accessing `/admin/dashboard` → access denied

---

## Mock Data Locations

Currently using mock data (replace with API calls later):

- `src/pages/customer/Services.tsx` - mockServices
- `src/pages/customer/TrackOrder.tsx` - mockOrders
- `src/pages/admin/Dashboard.tsx` - mockStats
- `src/pages/admin/Statistics.tsx` - mockRevenueData, mockServiceData
- `src/components/OperationalPanel.tsx` - mockOrders
- `src/components/EstimatorForm.tsx` - PRICES constant

---

## Next Steps

1. Connect to actual backend (update `.env` with backend URL)
2. Test authentication flow
3. Replace mock data with API calls using React Query
4. Add error handling and loading states

See `FRONTEND_NOTES.md` for detailed implementation notes.
See `IMPLEMENTATION_SUMMARY.md` for complete feature overview.
