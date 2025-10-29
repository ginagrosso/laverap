# Frontend API Integration Guide

This guide explains how to use the API integration layer in the LaverApp frontend.

## Overview

The frontend has been updated to correctly consume the backend API, handling all response format inconsistencies transparently.

## API Modules

### 1. Authentication (AuthContext)

The `AuthContext` handles user authentication and automatically manages token storage.

**Location:** [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx)

**Usage:**

```typescript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, token, login, register, logout, isAuthenticated, hasRole } = useAuth();

  // Login
  const handleLogin = async () => {
    await login({ email: "user@example.com", password: "password123" });
    // Token and user are automatically stored
  };

  // Register (automatically logs in after registration)
  const handleRegister = async () => {
    await register({
      nombre: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    // User is registered and logged in automatically
  };

  // Check user role
  if (hasRole("Administrador", "Dueño")) {
    // Show admin features
  }

  // Logout
  const handleLogout = () => logout();
}
```

**How it handles backend inconsistencies:**
- ✅ Login: Extracts `token` and `usuario` from `response.data`
- ✅ Register: Calls login automatically after registration (backend doesn't return token)
- ✅ Stores token in `localStorage` for persistence

---

### 2. Services API

**Location:** [frontend/src/lib/services.ts](frontend/src/lib/services.ts)

**Functions:**

#### `getServices(): Promise<Service[]>`

Get all available laundry services (public endpoint).

```typescript
import { getServices } from "@/lib/services";

const fetchServices = async () => {
  try {
    const services = await getServices();
    console.log(services); // Array of Service objects
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }
};
```

#### `createService(serviceData, token): Promise<Service>`

Create a new service (admin only).

```typescript
import { createService } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";

const CreateServiceForm = () => {
  const { token } = useAuth();

  const handleSubmit = async () => {
    const newService = await createService(
      {
        nombre: "Lavado Express",
        descripcion: "Servicio rápido en 24 horas",
        modeloDePrecio: "paqueteConAdicional",
        precioBase: 150,
        adicionales: { planchado: 50 },
      },
      token!
    );
  };
};
```

---

### 3. Orders API

**Location:** [frontend/src/lib/orders.ts](frontend/src/lib/orders.ts)

**Functions:**

#### `createOrder(orderData, token): Promise<Order>`

Create a new order for the authenticated user.

```typescript
import { createOrder } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";

const CreateOrderForm = () => {
  const { token } = useAuth();

  const handleSubmit = async () => {
    const order = await createOrder(
      {
        servicioId: "service-123",
        detalle: {
          cantidad: 2,
          incluyePlanchado: true,
        },
        observaciones: "Entregar antes de las 5pm",
      },
      token!
    );
    console.log("Order created:", order);
  };
};
```

#### `getMyOrders(token): Promise<Order[]>`

Get all orders for the authenticated user.

```typescript
import { getMyOrders } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";

const MyOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const myOrders = await getMyOrders(token!);
      setOrders(myOrders);
    };
    fetchOrders();
  }, [token]);
};
```

---

### 4. Users API

**Location:** [frontend/src/lib/users.ts](frontend/src/lib/users.ts)

**Functions:**

#### `getMyProfile(token): Promise<User>`

Get current user's profile.

```typescript
import { getMyProfile } from "@/lib/users";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { token } = useAuth();

  const refreshProfile = async () => {
    const profile = await getMyProfile(token!);
    console.log("Profile:", profile);
  };
};
```

#### `getAllUsers(token): Promise<User[]>`

Get all users (admin only).

```typescript
import { getAllUsers } from "@/lib/users";
import { useAuth } from "@/context/AuthContext";

const AdminUsersPage = () => {
  const { token, hasRole } = useAuth();

  if (!hasRole("Administrador")) {
    return <div>Access denied</div>;
  }

  const fetchUsers = async () => {
    const users = await getAllUsers(token!);
    console.log("All users:", users);
  };
};
```

---

## Using with React Query (TanStack Query)

The app already has TanStack Query set up. Here's how to integrate:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServices, createService } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";

// Fetch services
function ServicesPage() {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading services</div>;

  return <ServiceList services={services} />;
}

// Create service with mutation
function CreateServiceForm() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Partial<Service>) => createService(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create service");
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ /* service data */ });
    }}>
      {/* form fields */}
    </form>
  );
}
```

---

## Error Handling

All API functions throw errors that can be caught and handled:

```typescript
import { ApiError } from "@/lib/api";
import { toast } from "sonner";

try {
  const services = await getServices();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    console.error(`API Error ${error.status}:`, error.message);

    if (error.status === 401) {
      toast.error("Session expired. Please login again.");
      // Redirect to login
    } else if (error.status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else {
      toast.error(error.message);
    }
  } else {
    // Handle network or other errors
    console.error("Unexpected error:", error);
    toast.error("An unexpected error occurred");
  }
}
```

---

## Response Format Handling

The API modules automatically handle backend response wrapping:

| Endpoint | Backend Response | What You Get |
|----------|-----------------|--------------|
| `POST /auth/login` | `{ message, data: { usuario, token } }` | `{ usuario, token }` extracted from `data` |
| `POST /auth/register` | `{ message, usuario }` | Auto-login called after registration |
| `GET /servicios` | `{ message, data: Service[] }` | `Service[]` array |
| `POST /servicios` | `{ message, data: Service }` | `Service` object |
| `GET /orders` | `{ message, data: Order[] }` | `Order[]` array |
| `POST /orders` | `{ message, data: Order }` | `Order` object |
| `GET /users/me` | `{ message, data: User }` | `User` object |
| `GET /users` | `{ data: User[] }` | `User[]` array (no message field) |

**You don't need to worry about these inconsistencies** - the API modules handle it for you!

---

## TypeScript Types

All request/response types are defined in [frontend/src/types/index.ts](frontend/src/types/index.ts):

- `User`, `UserRole`
- `Service`, `PricingModel`
- `Order`, `OrderStatus`, `OrderDetail`
- `CreateOrderRequest`
- `LoginCredentials`, `RegisterData`

**Pricing Models Supported:**

1. **paqueteConAdicional** - Package with add-ons
   ```typescript
   detalle: {
     cantidad: 2,
     incluyePlanchado: true
   }
   ```

2. **porOpcionesMultiples** - Multiple options
   ```typescript
   detalle: {
     cantidad: 3,
     opciones: {
       tamaño: "grande",
       tipo: "delicado"
     }
   }
   ```

3. **porOpciones** - Single option
   ```typescript
   detalle: {
     cantidad: 1,
     opcion: "express"
   }
   ```

---

## Environment Variables

Make sure you have the correct API URL in your `.env` file:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

The frontend will default to `http://localhost:8080/api/v1` if not set.

---

## Testing the Integration

### 1. Start the backend:
```bash
cd backend
npm run dev  # Runs on port 8080
```

### 2. Start the frontend:
```bash
cd frontend
npm run dev  # Runs on port 5173
```

### 3. Test authentication flow:
- Navigate to `/register`
- Create an account
- Verify automatic login after registration
- Check that token is stored in localStorage
- Refresh page - should remain logged in

### 4. Test protected routes:
- Try accessing `/order/new` without login (should redirect)
- Login and access `/order/new` (should work)
- Try accessing `/admin/dashboard` as a regular user (should show access denied)

---

## Common Patterns

### Protected API Call with Error Handling

```typescript
import { createOrder } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

const MyComponent = () => {
  const { token } = useAuth();

  const handleCreateOrder = async (orderData: CreateOrderRequest) => {
    try {
      const order = await createOrder(orderData, token!);
      toast.success("Order created successfully!");
      return order;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error("Please login to create an order");
        } else if (error.status === 400) {
          toast.error(error.message); // Backend validation message
        } else {
          toast.error("Failed to create order");
        }
      }
      throw error;
    }
  };
};
```

### Conditional Rendering Based on Auth

```typescript
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, hasRole } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.nombre}</span>
          {hasRole("Administrador", "Dueño") && (
            <Link to="/admin/dashboard">Admin Panel</Link>
          )}
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};
```

---

## Migration Checklist

If you have existing code that needs updating:

- ✅ **AuthContext**: Already updated to handle backend response formats
- ✅ **API base URL**: Changed from port 3000 to 8080
- ✅ **Types**: Updated with all 5 pricing models
- ✅ **API modules**: Created for services, orders, and users
- ✅ **Error handling**: `ApiError` class available for typed error handling
- ⚠️ **Existing pages**: May need to update to use new API modules

---

## Next Steps

1. Update your existing pages to use the new API modules
2. Replace any direct `api.post()` calls with the specific functions from API modules
3. Add React Query hooks for better data fetching and caching
4. Implement loading and error states in your UI components

---

## Support

For detailed backend API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

For questions about the codebase architecture, see [CLAUDE.md](CLAUDE.md).
