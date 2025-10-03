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