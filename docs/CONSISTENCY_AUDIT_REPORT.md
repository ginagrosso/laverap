# 🔍 Auditoría de Consistencia: Frontend ↔ Backend ↔ Firebase

**Proyecto:** Laverap
**Fecha:** 2025-10-17
**Auditor:** Claude Code

---

## 📊 Resumen Ejecutivo

Se realizó una auditoría completa de la consistencia de datos entre el frontend (React + TypeScript), backend (Node.js + Express), y la base de datos Firebase Firestore.

**Estado General:** ✅ **BUENO** - La mayoría de las operaciones son consistentes, pero se encontraron **inconsistencias críticas** que deben corregirse.

---

## ✅ Aspectos Consistentes

### 1. Estructura de Datos de Órdenes (Pedidos)

**Frontend → Backend → Firebase: CONSISTENTE ✅**

- **Frontend** envía: `{ servicioId, detalle, observaciones }`
- **Backend** espera: `{ servicioId, detalle, observaciones }` + extrae `clienteId` del JWT
- **Firebase** almacena: Estructura completa con todos los campos calculados

```typescript
// FRONTEND (types/index.ts)
export interface CreateOrderRequest {
  servicioId: string;
  detalle: OrderDetail;
  observaciones?: string;
}

// BACKEND (order.controller.js)
const orderData = req.body; // { servicioId, detalle, observaciones }
const clienteId = req.user.id; // Del JWT

// FIREBASE (colección: pedidos)
{
  clienteId: "SL7DYEi6Riq4m1lA3pf8",
  servicio: { id: "...", nombre: "..." },
  detalle: { cantidad: 1, ... },
  observaciones: "...",
  precioEstimado: 5000,
  estado: "Recibido",
  fechaCreacion: Timestamp
}
```

✅ **Los campos coinciden perfectamente.**

---

### 2. Estructura de Datos de Servicios

**Frontend → Backend → Firebase: CONSISTENTE ✅**

- Los tipos TypeScript del frontend coinciden con la estructura de Firestore
- Los modelos de precios están correctamente tipados
- La respuesta del backend incluye el wrapper esperado: `{ message, data }`

```typescript
// FRONTEND
export interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  modeloDePrecio: PricingModel;
  // ... campos opcionales según modelo
}

// FIREBASE
{
  nombre: "Lavado de Acolchados",
  descripcion: "...",
  modeloDePrecio: "porOpcionesMultiples",
  precioBase: 1000,
  opciones: { ... }
}
```

✅ **Perfectamente alineados.**

---

### 3. Autenticación y Autorización

**Frontend → Backend: CONSISTENTE ✅**

- El frontend envía el token JWT en el header `Authorization: Bearer <token>`
- El backend valida correctamente con el middleware `protect`
- El `clienteId` se extrae correctamente del token JWT

---

## 🚨 Inconsistencias Críticas Encontradas

### 1. **CRÍTICO**: Formato de Timestamp en Firebase

**Problema:** El frontend espera `Date` o `{ seconds, nanoseconds }` pero Firebase devuelve objetos Timestamp de Firestore.

**Ubicación:**
- [frontend/src/types/index.ts:95](frontend/src/types/index.ts:95)
- [frontend/src/pages/customer/TrackOrder.tsx:47-53](frontend/src/pages/customer/TrackOrder.tsx:47-53)

**En Firebase:**
```javascript
fechaCreacion: {
  __type__: "Timestamp",
  value: "2025-10-09T21:14:56.031Z"
}
```

**El frontend maneja ambos casos:**
```typescript
const formatDate = (date: Date | { seconds: number; nanoseconds: number }) => {
  if (date instanceof Date) {
    return format(date, "dd MMM yyyy", { locale: es });
  }
  // Handle Firestore timestamp
  return format(new Date(date.seconds * 1000), "dd MMM yyyy", { locale: es });
};
```

**⚠️ PROBLEMA:** El backend NO está serializando correctamente los Timestamps de Firestore antes de enviarlos al frontend.

**Impacto:**
- Las fechas pueden fallar si el backend envía el objeto Timestamp nativo de Firebase
- Inconsistencia entre desarrollo (puede funcionar) y producción

**Solución requerida:**
```javascript
// backend/src/core/services/order.service.js
snapshot.forEach(doc => {
  const data = doc.data();
  orders.push({
    id: doc.id,
    ...data,
    fechaCreacion: data.fechaCreacion.toDate() // ✅ Convertir a Date
  });
});
```

---

### 2. **CRÍTICO**: Estados de Órdenes Inconsistentes

**Problema:** El frontend define 4 estados, pero Firebase solo usa 1.

**Frontend ([types/index.ts:5](frontend/src/types/index.ts:5)):**
```typescript
export type OrderStatus = "Recibido" | "En Proceso" | "Listo" | "Entregado";
```

**Firebase (datos reales):**
```
TODAS las órdenes están en estado: "Recibido"
```

**Frontend ([TrackOrder.tsx:16-45](frontend/src/pages/customer/TrackOrder.tsx:16-45)):**
```typescript
const statusConfig = {
  "Recibido": { ... },
  "En Proceso": { ... },
  "Listo": { ... },
  "Entregado": { ... }
};
```

**⚠️ PROBLEMA:**
- No existe funcionalidad para actualizar el estado de las órdenes
- Los estados "En Proceso", "Listo", "Entregado" nunca se usan
- El UI muestra un timeline de progreso que nunca avanza

**Impacto:**
- Mala experiencia de usuario (el tracking no funciona realmente)
- Funcionalidad de seguimiento de pedidos incompleta

**Solución requerida:**
1. Crear endpoint `PATCH /api/v1/orders/:id` para actualizar estado (solo admin)
2. Implementar función en el servicio del backend
3. Crear interfaz de administración para cambiar estados

---

### 3. **MEDIO**: Rol de Usuario Inconsistente

**Problema:** Discrepancia entre tipos frontend y datos reales en Firebase.

**Frontend ([types/index.ts:3](frontend/src/types/index.ts:3)):**
```typescript
export type UserRole = "Cliente" | "Administrador" | "Empleado" | "Dueño";
```

**Firebase (datos reales):**
```javascript
{ rol: "cliente" }  // minúscula
{ rol: "admin" }    // NO "Administrador"
```

**Backend ([auth.middleware.js](backend/src/api/middlewares/auth.middleware.js)):**
```javascript
authorize('admin') // Usa 'admin', no 'Administrador'
```

**⚠️ PROBLEMA:**
- **Inconsistencia de capitalización**: Frontend usa "Cliente", Firebase usa "cliente"
- **Nombres diferentes**: Frontend usa "Administrador", Backend/Firebase usa "admin"

**Impacto:**
- Posibles fallos en validación de roles
- Confusión en el código

**Solución requerida:**
Estandarizar a minúsculas en todos lados:
```typescript
export type UserRole = "cliente" | "admin" | "empleado" | "dueño";
```

---

### 4. **BAJO**: Campo `observaciones` - Null vs Undefined

**Problema:** Inconsistencia entre usar `null` y `undefined`.

**Frontend:**
```typescript
observaciones?: string; // Puede ser undefined
```

**Firebase:**
```javascript
observaciones: null  // Usa null explícitamente
```

**Backend:**
```javascript
observaciones = null  // Default a null
```

**Solución recomendada:**
Estandarizar a usar `null` para campos opcionales vacíos:
```typescript
observaciones: string | null;
```

---

## 🔐 Firebase Security Rules

### Estado Actual: ⚠️ **INSEGURO - TEMPORAL**

```javascript
match /{document=**} {
  allow read, write: if request.time < timestamp.date(2025, 11, 2);
}
```

**⚠️ CRÍTICO:**
- **Reglas completamente abiertas** hasta el 2 de noviembre de 2025
- Cualquier cliente puede leer/escribir TODOS los datos
- No hay validación de autenticación
- No hay validación de autorización

**Riesgo:**
- Cualquier usuario puede ver pedidos de otros usuarios
- Cualquier usuario puede modificar o eliminar datos
- Exposición de datos sensibles (emails, contraseñas hasheadas)
- Posibles ataques de inyección de datos

### Reglas de Seguridad Recomendadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/clientes/$(request.auth.uid)).data.rol == 'admin';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Colección: clientes
    match /clientes/{userId} {
      // Los usuarios pueden leer su propio documento
      allow read: if isOwner(userId) || isAdmin();

      // Solo el usuario puede actualizar su propio perfil (excepto rol)
      allow update: if isOwner(userId) &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['rol']);

      // Solo admins pueden crear usuarios
      allow create: if isAdmin();

      // Nadie puede eliminar usuarios (soft delete recomendado)
      allow delete: if false;
    }

    // Colección: pedidos
    match /pedidos/{orderId} {
      // Los usuarios solo pueden leer sus propios pedidos, admins pueden leer todos
      allow read: if isOwner(resource.data.clienteId) || isAdmin();

      // Los usuarios pueden crear pedidos para sí mismos
      allow create: if isAuthenticated() &&
                      request.resource.data.clienteId == request.auth.uid &&
                      request.resource.data.estado == 'Recibido';

      // Solo admins pueden actualizar pedidos (cambiar estado)
      allow update: if isAdmin();

      // Nadie puede eliminar pedidos
      allow delete: if false;
    }

    // Colección: servicios
    match /servicios/{serviceId} {
      // Todos pueden leer servicios (público)
      allow read: if true;

      // Solo admins pueden crear, actualizar o eliminar servicios
      allow create, update, delete: if isAdmin();
    }
  }
}
```

---

## 🔄 Operaciones CRUD - Estado Actual

### ✅ Implementadas y Consistentes:

| Operación | Endpoint | Frontend | Backend | Firebase |
|-----------|----------|----------|---------|----------|
| **GET** Servicios | `GET /api/v1/servicios` | ✅ | ✅ | ✅ |
| **POST** Servicio | `POST /api/v1/servicios` | ✅ | ✅ | ✅ |
| **GET** Mis Órdenes | `GET /api/v1/orders` | ✅ | ✅ | ✅ |
| **POST** Crear Orden | `POST /api/v1/orders` | ✅ | ✅ | ✅ |

### ❌ Faltantes / No Implementadas:

| Operación | Estado | Necesidad |
|-----------|--------|-----------|
| **PATCH** Actualizar Estado Orden | ❌ No existe | **CRÍTICO** - Para tracking |
| **GET** Orden por ID | ❌ No existe | Útil para detalles |
| **GET** Todas las órdenes (admin) | ❌ No existe | Necesario para admin |
| **DELETE** Cancelar Orden | ❌ No existe | Opcional (soft delete) |
| **PUT/PATCH** Actualizar Servicio | ❌ No existe | Necesario para admin |
| **DELETE** Eliminar Servicio | ❌ No existe | Necesario para admin |

---

## 📝 Recomendaciones Prioritarias

### 🔴 Prioridad Alta (Corregir Inmediatamente)

1. **Implementar reglas de seguridad de Firebase**
   - Actualmente CUALQUIERA puede leer/escribir
   - Implementar las reglas propuestas arriba

2. **Serializar Timestamps correctamente en el backend**
   - Convertir Firestore Timestamps a Date antes de enviar al frontend
   - Ubicación: `backend/src/core/services/order.service.js:85`

3. **Implementar actualización de estados de órdenes**
   - Crear endpoint: `PATCH /api/v1/orders/:id`
   - Crear servicio backend para actualizar estado
   - Permitir solo a admins

### 🟡 Prioridad Media

4. **Estandarizar roles de usuario**
   - Cambiar frontend a minúsculas: `"cliente"`, `"admin"`
   - O cambiar backend/Firebase a coincidir con frontend
   - Recomendado: usar minúsculas en todos lados

5. **Crear endpoint para admins ver todas las órdenes**
   - `GET /api/v1/orders/all` (solo admin)
   - Necesario para panel de administración

6. **Implementar CRUD completo de servicios**
   - `PUT/PATCH /api/v1/servicios/:id` - Actualizar
   - `DELETE /api/v1/servicios/:id` - Eliminar

### 🟢 Prioridad Baja

7. **Estandarizar manejo de valores nulos**
   - Usar `null` consistentemente en lugar de `undefined`
   - Actualizar tipos TypeScript

8. **Agregar validación de schemas**
   - Usar biblioteca como Zod o Joi
   - Validar payloads en backend antes de guardar en Firebase

9. **Agregar índices de Firestore**
   - Para `pedidos` ordenados por `fechaCreacion` + filtrados por `clienteId`
   - Para optimizar consultas

---

## 📐 Estructura de Datos - Referencia Rápida

### Colección: `pedidos`

```typescript
{
  id: string,                    // Auto-generado por Firestore
  clienteId: string,             // Referencia a clientes/{id}
  servicio: {
    id: string,                  // Referencia a servicios/{id}
    nombre: string               // Denormalizado para performance
  },
  detalle: {
    cantidad: number,
    // Campos específicos según modeloDePrecio:
    incluyePlanchado?: boolean,           // paqueteConAdicional
    opcion?: string,                      // porOpciones
    opciones?: Record<string, string>     // porOpcionesMultiples
  },
  observaciones: string | null,
  precioEstimado: number,
  estado: "Recibido" | "En Proceso" | "Listo" | "Entregado",
  fechaCreacion: Timestamp
}
```

### Colección: `servicios`

```typescript
{
  id: string,
  nombre: string,
  descripcion: string,
  modeloDePrecio: "porCanasto" | "porUnidad" | "paqueteConAdicional" |
                  "porOpciones" | "porOpcionesMultiples",

  // Campos condicionales según modeloDePrecio:
  precioPorCanasto?: number,             // porCanasto
  itemsPorCanasto?: number,              // porCanasto
  minimoItems?: number,                  // porCanasto

  precioBase?: number,                   // porUnidad, paqueteConAdicional, porOpcionesMultiples
  minimoUnidades?: number,               // porUnidad, porOpcionesMultiples

  adicionales?: {                        // paqueteConAdicional
    planchado: number
  },

  opciones?: Record<string, number> |    // porOpciones (flat)
             Record<string, Record<string, number>>  // porOpcionesMultiples (nested)
}
```

### Colección: `clientes`

```typescript
{
  id: string,
  nombre: string,
  email: string,
  password: string,              // Hasheado con bcrypt
  rol: "cliente" | "admin",      // ⚠️ Inconsistente con frontend
  fechaCreacion: Timestamp
}
```

---

## 🎯 Conclusión

El sistema tiene una **base sólida** con la mayoría de las operaciones CRUD funcionando correctamente. Sin embargo, existen **inconsistencias críticas** que deben corregirse:

1. **Seguridad de Firebase**: Reglas abiertas temporalmente
2. **Timestamps**: Serialización incorrecta
3. **Estados de órdenes**: No se pueden actualizar (funcionalidad incompleta)
4. **Roles**: Nomenclatura inconsistente

**Recomendación:** Priorizar la corrección de las inconsistencias de Prioridad Alta antes de lanzar a producción.

---

**Fin del reporte**
