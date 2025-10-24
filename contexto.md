# Contexto del Proyecto: LAVERAPP (TFI-TUP 2025)

## 1. Visión General

* [cite_start]**Proyecto:** LAVERAPP [cite: 279][cite_start], un SaaS web para digitalizar la gestión de una lavandería local llamada "Laverap"[cite: 273, 281].
* [cite_start]**Alumnos y Roles**:
    * **Risso, Victor Teo:** Backend (API REST, Base de Datos, Seguridad, Despliegue).
    * **Grosso, Gina:** Frontend (UI/UX, Next.js, Consumo de API, Testing e2e).
* [cite_start]**Problema a Resolver:** La gestión manual actual provoca falta de trazabilidad, errores operativos y demoras, afectando la satisfacción del cliente [cite: 286-293].
* [cite_start]**Solución Propuesta:** Un sistema que gestiona todo el ciclo de vida del servicio: solicitud, pago, seguimiento en tiempo real y entrega[cite: 295, 296].

## 2. Actores del Sistema

* [cite_start]**Cliente:** Crea pedidos, sigue su estado y realiza pagos[cite: 8].
* [cite_start]**Empleado/Operario:** Actualiza el estado de los lavados[cite: 7].
* [cite_start]**Administrador:** Gestiona el catálogo de servicios, precios y supervisa los pedidos[cite: 6].
* [cite_start]**Dueño:** Analiza reportes de rendimiento del negocio[cite: 5, 40].

## 3. Pila Tecnológica (Tech Stack)

* [cite_start]**Backend:** API REST con **Node.js + Express**[cite: 331].
* [cite_start]**Frontend:** **Next.js + Tailwind CSS**[cite: 331].
* [cite_start]**Base de Datos:** **Firebase Firestore**[cite: 331, 241]. [cite_start]Se usarán colecciones para `clientes`, `pedidos`, `servicios`, `pagos` y `auditoria`[cite: 244].
* [cite_start]**Autenticación:** **JWT** con control de acceso basado en roles (**RBAC**)[cite: 239, 570].
* [cite_start]**Despliegue:** Backend en **Render**, Frontend en **Vercel**[cite: 253, 255, 351].

## 4. Requerimientos Funcionales Clave (RF)

* [cite_start]**RF1 - Usuarios & Autenticación:** Registro/login, perfiles y permisos por rol (Cliente, Admin/Operario)[cite: 310, 315].
* [cite_start]**RF2 - Catálogo & Precios:** El administrador puede gestionar servicios y sus tarifas (por kg/prenda)[cite: 316, 318].
* [cite_start]**RF3 - Pedidos (Cliente):** El cliente crea un pedido, recibe un precio estimado y un comprobante digital[cite: 319, 320].
* **RF4 - Seguimiento & Notificaciones:** El estado del pedido es visible en tiempo real (`Recibido` -> `En Proceso` -> `Listo` -> `Entregado`). [cite_start]Se envían notificaciones al cliente[cite: 321, 322].
* [cite_start]**RF5 - Pagos:** Registro de pagos en el local (efectivo/transferencia) y control de saldos pendientes[cite: 324, 325].
* [cite_start]**RF6 - Panel Operativo:** Un tablero para que el personal gestione los pedidos, actualice estados y registre incidencias[cite: 326, 327].
* [cite_start]**RF7 - Reportes:** Dashboard con métricas de negocio (volumen, ingresos, tiempos)[cite: 328, 329].

## 5. Historias de Usuario Prioritarias (MVP)

* [cite_start]**HU1: Crear Pedido:** "Como cliente, quiero crear un pedido con servicios y cantidad para conocer el precio estimado y obtener un comprobante"[cite: 391].
* [cite_start]**HU2: Actualizar Estado:** "Como administrador, quiero actualizar el estado del pedido y notificar al cliente para mantener la trazabilidad"[cite: 398].
* [cite_start]**HU3: Registrar Pagos:** "Como administrador, quiero registrar pagos en el local y emitir un comprobante para cerrar la venta"[cite: 401].

## 6. Arquitectura General

[cite_start]El sistema sigue una arquitectura cliente-servidor[cite: 557]. [cite_start]Un **Frontend** (Next.js) se comunica vía **HTTPS** con una **API REST Backend** (Node.js/Express) [cite: 341-346]. [cite_start]El backend, a su vez, gestiona la lógica de negocio y persiste los datos en una base de datos **Firebase Firestore** en la nube[cite: 256, 348]. [cite_start]Se integra con servicios externos para el envío de **Notificaciones**[cite: 259].

# Contexto del Proyecto: LAVERAPP (TFI-TUP 2025)

## 1. Visión General 📜

* **Proyecto:** LAVERAPP, un SaaS web para digitalizar la gestión de la lavandería "Laverap" ubicada en Av. 9 de julio 3899, Resistencia.
* **Alumnos y Roles**:
    * **Risso, Victor Teo:** Backend (API REST, Base de Datos, Seguridad, Despliegue).
    * **Grosso, Gina:** Frontend (UI/UX, Next.js, Consumo de API, Testing e2e).
* **Problema a Resolver:** La gestión manual actual (libretas/WhatsApp) provoca falta de trazabilidad, errores operativos (confusión de prendas, omisiones de cobro) y demoras, afectando la satisfacción del cliente.
* **Solución Propuesta:** Un sistema web responsivo para gestionar pedidos, estados y cobros, mejorando tiempos, trazabilidad y comunicación. El precio mostrado al cliente es **estimado** y se confirma en el local. El MVP no incluye pagos online ni gestión de delivery.

## 2. Actores del Sistema 👥

* **Cliente:** Se registra/loguea, consulta servicios, crea pedidos (indicando detalles), ve su historial y recibe notificaciones.
* **Administrador (`admin`):** Gestiona el catálogo de servicios y precios, supervisa pedidos y puede ver todos los usuarios. Tiene permisos CRUD sobre los servicios.
* **Empleado/Operario:** Actualiza el estado de los pedidos. (Funcionalidad futura).
* **Dueño:** Revisa reportes. (Funcionalidad futura).

## 3. Pila Tecnológica (Tech Stack) 💻

* **Backend:** API REST con **Node.js + Express**.
    * Node.js: v20.11+.
    * Express: v5.1.0.
* **Frontend:** **React + Vite** (según `Risso-Grosso_GestionDependencias.pdf`, aunque `1PlanTrabajoTFI-TUP-2025.pdf` menciona Next.js + Tailwind).
    * React: v18.3.1.
    * Vite: v5.4.19.
* **Base de Datos:** **Firebase Firestore**. Colecciones principales: `clientes`, `servicios`, `pedidos`.
    * Firebase Admin SDK: v13.5.0.
* **Autenticación:** **JWT** con control de acceso basado en roles (**RBAC**). Roles definidos: `cliente`, `admin`.
* **Despliegue:** Backend en **Render**, Frontend en **Vercel**.
* **Gestión de Proyecto:** Jira, GitHub.

## 4. Arquitectura 🏗️

* **Tipo:** Cliente-Servidor en 3 capas.
    * **Presentación:** Frontend (React/Vite) en el navegador del usuario.
    * **Lógica de Negocio:** API REST (Node.js/Express) en el servidor.
    * **Datos:** Firebase Firestore en la nube.
* **Comunicación:** HTTPS entre capas.
* **Repositorio:** Monorepo con carpetas separadas para `backend` y `frontend`.

## 5. Requerimientos Funcionales Clave (RF) 🎯

* **RF1 - Usuarios & Auth:** Registro, Login, Perfil propio (`/me`). Roles: `cliente`, `admin`. **(Implementado)**
* **RF2 - Catálogo & Precios:** Admin gestiona CRUD de servicios. Clientes listan servicios. **(Implementado)**
* **RF3 - Pedidos (Cliente):** Cliente crea pedido con precio estimado y ve historial. **(Implementado)**
* **RF4 - Seguimiento & Notificaciones:** Actualización de estados (`Recibido` -> ... -> `Entregado`). Notificaciones al cliente. **(Pendiente)**
* **RF5 - Pagos:** Registro de pagos en local (efectivo/transferencia). **(Pendiente, MVP no requiere pago online)**
* **RF6 - Panel Operativo:** Tablero para Admin/Operario para gestionar pedidos. **(Pendiente)**
* **RF7 - Reportes:** Dashboard con métricas. **(Pendiente)**

## 6. Modelos de Datos en Firestore (`servicios`) 📄

La colección `servicios` usa `modeloDePrecio` para determinar el cálculo:

* **`paqueteConAdicional`**: Precio base fijo + opcionales que suman un monto fijo.
    * Ej: Paquete 12 Prendas (Base $1000 + Planchado $1000).
    * Campos: `nombre`, `modeloDePrecio`, `descripcion`, `precioBase`, `adicionales` (mapa).
* **`porOpcionesMultiples`**: Precio base + suma de valores según múltiples selecciones del cliente.
    * Ej: Ropa de Cama (Base $1000 + Tipo + Tamaño).
    * Campos: `nombre`, `modeloDePrecio`, `descripcion`, `minimoUnidades`, `precioBase`, `opciones` (mapa anidado).
* **`porOpciones`**: Precio definido por *una* opción seleccionada de una lista.
    * Ej: Prendas Especiales (TRAJE COMPLETO -> $4000).
    * Campos: `nombre`, `modeloDePrecio`, `descripcion`, `opciones` (mapa: nombre_opcion -> precio).

## 7. Endpoints API Implementados (Backend) ↔️

* **Autenticación (`/api/v1/auth`)**
    * `POST /register` (Público)
    * `POST /login` (Público)
* **Usuarios (`/api/v1/users`)**
    * `GET /me` (Protegido - Cliente/Admin)
    * `GET /` (Protegido - Admin)
* **Servicios (`/api/v1/servicios`)**
    * `GET /` (Público)
    * `POST /` (Protegido - Admin)
    * `PATCH /:id` (Protegido - Admin)
    * `DELETE /:id` (Protegido - Admin)
* **Pedidos (`/api/v1/orders`)**
    * `POST /` (Protegido - Cliente/Admin)
    * `GET /` (Protegido - Cliente/Admin, solo ve los propios)

## 8. Prácticas y Convenciones de Desarrollo ✨

* **Calidad de Código:**
    * Linter: ESLint (configuración en `frontend/eslint.config.js`).
    * Formateador: Prettier.
    * Automatización: Husky con ganchos pre-commit para ejecutar ESLint y Prettier.
* **Nomenclatura:**
    * Variables/Funciones: `camelCase`.
    * Clases/Componentes: `PascalCase`.
    * Archivos Backend: `kebab-case.js` (ej: `order.service.js`).
    * Archivos Frontend: `PascalCase.tsx`.
    * Constantes: `UPPER_SNAKE_CASE`.
* **Arquitectura:**
    * Separación de Lógica: Lógica de negocio en capa de servicios (`/core/services`).
    * Manejo de Errores: Lanzar errores específicos desde servicios.
* **Control de Versiones (Git):**
    * Rama `main` protegida.
    * Desarrollo en ramas `feature/nombre-feature`.
    * Pull Requests (PR) con revisión por pares y paso de CI (GitHub Actions) para fusionar a `main`.

## 9. Gestión de Dependencias (Backend - npm) 📦

* **Herramientas:** Se utiliza **npm** como gestor de paquetes. Los archivos clave son:
    * `package.json`: Define las dependencias directas (de producción y desarrollo) y scripts del proyecto.
    * `package-lock.json`: Registra las versiones exactas de todas las dependencias instaladas (directas y transitivas) para asegurar compilaciones reproducibles. **Este archivo debe ser versionado en Git**.
* **Dependencias Directas (Producción - `dependencies`):**
    * `bcryptjs`: Para hashear contraseñas de forma segura.
    * `dotenv`: Para cargar variables de entorno desde archivos `.env`.
    * `express`: Framework web para construir la API REST.
    * `firebase-admin`: SDK oficial para interactuar con Firebase desde el backend.
    * `jsonwebtoken`: Para crear y verificar tokens JWT para la autenticación.
* **Dependencias Directas (Desarrollo - `devDependencies`):**
    * `nodemon`: Para reiniciar automáticamente el servidor durante el desarrollo al detectar cambios en los archivos.
* **Dependencias Transitivas:** Son las dependencias que nuestras dependencias directas necesitan para funcionar. Npm las gestiona automáticamente y quedan registradas en `package-lock.json`. Ejemplos (no exhaustivo): `google-auth-library` (usada por `firebase-admin`), `ms` (usada por `jsonwebtoken`), `debug` (usada por `express`).

## 10. Próximos Pasos (Según Plan de Trabajo) 🚀

1.  **Actualización de Estado de Pedidos:** Implementar endpoint (`PATCH /api/v1/orders/:id/status`) para que Admin/Operario cambie el estado (`Recibido`, `En Proceso`, `Listo`, `Entregado`).
2.  **Reportes:** Crear endpoints (`/api/v1/reports/...`) para métricas básicas (volumen, ingresos).
3.  **Notificaciones:** Integrar un sistema (ej: Firebase Cloud Messaging o email) para notificar al cliente sobre cambios de estado.
4.  **Testing:** Escribir pruebas unitarias y de integración para la lógica de negocio y los endpoints.
5.  **Despliegue:** Configurar el despliegue en Render.