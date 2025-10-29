# LaverApp API Quick Reference

## 🚀 Getting Started

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Port 8080

# Terminal 2 - Frontend
cd frontend
npm run dev  # Port 5173
```

## 🔑 Authentication

```typescript
import { useAuth } from "@/context/AuthContext";

const { user, token, login, register, logout, hasRole } = useAuth();

// Register (auto-logs in)
await register({
  nombre: "John Doe",
  email: "john@example.com",
  password: "password123"
});

// Login
await login({
  email: "john@example.com",
  password: "password123"
});

// Check role
if (hasRole("Administrador")) { /* admin stuff */ }

// Logout
logout();
```

## 📦 Services API

```typescript
import { getServices, createService } from "@/lib/services";

// Get all services (public)
const services = await getServices();

// Create service (admin only)
const service = await createService({
  nombre: "Lavado Express",
  modeloDePrecio: "paqueteConAdicional",
  precioBase: 150,
  adicionales: { planchado: 50 }
}, token!);
```

## 🧺 Orders API

```typescript
import { createOrder, getMyOrders } from "@/lib/orders";

// Create order
const order = await createOrder({
  servicioId: "service-123",
  detalle: {
    cantidad: 2,
    incluyePlanchado: true
  },
  observaciones: "Entregar mañana"
}, token!);

// Get my orders
const orders = await getMyOrders(token!);
```

## 👥 Users API

```typescript
import { getMyProfile, getAllUsers } from "@/lib/users";

// Get my profile
const profile = await getMyProfile(token!);

// Get all users (admin only)
const users = await getAllUsers(token!);
```

## 🎯 React Query Examples

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { getServices, createOrder } from "@/lib";
import { useAuth } from "@/context/AuthContext";

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["services"],
  queryFn: getServices
});

// Mutate data
const { token } = useAuth();
const mutation = useMutation({
  mutationFn: (orderData) => createOrder(orderData, token!),
  onSuccess: () => toast.success("Order created!")
});
```

## 🛡️ Protected Routes

```typescript
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Any authenticated user
<ProtectedRoute>
  <CreateOrder />
</ProtectedRoute>

// Admin only
<ProtectedRoute allowedRoles={["Administrador", "Dueño"]}>
  <AdminDashboard />
</ProtectedRoute>
```

## 🏷️ User Roles

- `"Cliente"` - Customer (default)
- `"Administrador"` - Administrator
- `"Empleado"` - Employee
- `"Dueño"` - Owner

## 📊 Pricing Models

### 1. paqueteConAdicional
```typescript
detalle: {
  cantidad: 2,
  incluyePlanchado: true
}
```

### 2. porOpcionesMultiples
```typescript
detalle: {
  cantidad: 3,
  opciones: {
    tamaño: "grande",
    tipo: "delicado"
  }
}
```

### 3. porOpciones
```typescript
detalle: {
  cantidad: 1,
  opcion: "express"
}
```

## ❌ Error Handling

```typescript
import { ApiError } from "@/lib/api";
import { toast } from "sonner";

try {
  await createOrder(data, token);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      toast.error("Please login");
    } else if (error.status === 403) {
      toast.error("Permission denied");
    } else {
      toast.error(error.message);
    }
  }
}
```

## 🌐 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register user |
| POST | `/auth/login` | ❌ | Login |
| GET | `/users/me` | ✅ | Get profile |
| GET | `/users` | 👑 Admin | Get all users |
| GET | `/servicios` | ❌ | Get services |
| POST | `/servicios` | 👑 Admin | Create service |
| GET | `/orders` | ✅ | Get my orders |
| POST | `/orders` | ✅ | Create order |

Legend: ❌ Public | ✅ Authenticated | 👑 Admin Only

## 📝 Environment Variables

```bash
# Frontend .env
VITE_API_URL=http://localhost:8080/api/v1

# Backend .env
PORT=8080
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

## 📚 Documentation

- **Backend API**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Integration Guide**: [FRONTEND_API_INTEGRATION.md](FRONTEND_API_INTEGRATION.md)
- **Architecture**: [CLAUDE.md](CLAUDE.md)
- **Summary**: [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)

## ✅ Verification

TypeScript compilation: ✅ **PASSED**
```bash
cd frontend && npm run build
# ✓ built in 5.25s
```

All response format inconsistencies handled automatically by API modules.