// Type definitions based on backend contracts and Firebase Firestore structure

// ============================================================================
// USER TYPES
// ============================================================================

// CORRECTED: Backend only supports these 3 roles (removed "empleado" and "dueño", added "operario")
export type UserRole = "cliente" | "admin" | "operario";

// CORRECTED: Added missing fields from Firebase structure
export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  rol: UserRole;
  activo: boolean;
  passwordTemporal?: boolean; // For newly created users by admin
  fechaCreacion?: Date | string; // Firestore Timestamp or ISO string
  fechaActualizacion?: Date | string;
  fechaDesactivacion?: Date | string;
}

// Backend login response structure
export interface AuthResponse {
  message: string;
  data: {
    token: string;
    usuario: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  rol?: UserRole;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = "Pendiente" | "En Proceso" | "Finalizado" | "Entregado" | "Cancelado";

// CORRECTED: Order detail structures matching backend validation schemas

// For paqueteConAdicional model
export interface PaqueteConAdicionalDetail {
  adicionales?: string[]; // Array of additional service names selected (e.g., ["planchado"])
}

// For porOpcionesMultiples model
// NOTE: This can be either an object (single item) OR an array (multiple items with quantities)

// Single item format (object)
export interface PorOpcionesMultiplesDetailObject {
  [categoria: string]: string; // e.g., { "Tamaño": "Grande", "Tipo": "Delicado" }
}

// Multiple items format (array)
export interface PorOpcionesMultiplesDetailItem {
  opcionesSeleccionadas: Record<string, string>; // e.g., { "Tamaño": "Grande", "Tipo": "Delicado" }
  cantidad: number;
}

export type PorOpcionesMultiplesDetail = PorOpcionesMultiplesDetailObject | PorOpcionesMultiplesDetailItem[];

// For porOpciones model
export interface PorOpcionesDetail {
  opcion?: string; // Single option selected (e.g., "CAMPERAS")
  opcionSeleccionada?: string; // Alternative field name
}

// Union type for order details
export type OrderDetail =
  | PaqueteConAdicionalDetail
  | PorOpcionesMultiplesDetail
  | PorOpcionesDetail;

export interface Order {
  id: string;
  clienteId: string;
  servicio: {
    id: string;
    nombre: string;
  };
  detalle: OrderDetail;
  observaciones: string | null;
  precioEstimado: number;
  estado: OrderStatus;
  activo: boolean;
  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;
  fechaEliminacion?: Date | string;
}

export interface CreateOrderRequest {
  clienteId?: string; // Optional - only for admin creating orders for specific clients
  servicioId: string;
  detalle: OrderDetail;
  observaciones?: string | null;
}

export interface UpdateOrderRequest {
  servicioId?: string;
  detalle?: OrderDetail;
  observaciones?: string;
  estado?: OrderStatus;
  precioEstimado?: number;
}

export interface CancelOrderRequest {
  observaciones?: string;
}

export interface UpdateOrderStatusRequest {
  estado: OrderStatus;
  observaciones?: string;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

// CORRECTED: Backend only supports these 3 pricing models (removed "porCanasto" and "porUnidad")
export type PricingModel =
  | "paqueteConAdicional"
  | "porOpciones"
  | "porOpcionesMultiples";

// CORRECTED: Service structure matching Firebase (FLAT structure, no nested configuracionPrecios)
export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  modeloDePrecio: PricingModel;
  activo: boolean;
  fechaCreacion?: string; // ISO string format (not Firestore Timestamp)
  fechaDesactivacion?: string; // ISO string format

  // For paqueteConAdicional and porOpcionesMultiples
  precioBase?: number;

  // For paqueteConAdicional only
  adicionales?: Record<string, number>; // e.g., { "planchado": 500 }

  // For porOpciones only (flat structure)
  // For porOpcionesMultiples only (nested structure)
  // NOTE: opciones can be either flat Record<string, number> OR nested Record<string, Record<string, number>>
  opciones?: Record<string, number> | Record<string, Record<string, number>>;

  // For porOpcionesMultiples only
  minimoUnidades?: number;
}

// CORRECTED: Service creation/update matching backend schema (FLAT structure)
export interface CreateServiceRequest {
  nombre: string;
  descripcion: string;
  modeloDePrecio: PricingModel;
  activo?: boolean;

  // Conditional fields based on pricing model
  precioBase?: number;
  adicionales?: Record<string, number>;
  opciones?: Record<string, number> | Record<string, Record<string, number>>;
  minimoUnidades?: number;
}

export type UpdateServiceRequest = CreateServiceRequest;

// Service form data types for admin panel (keeping for backwards compatibility)
export interface PaqueteConAdicionalConfig {
  precioBase: number;
  adicionales: Record<string, number>;
}

export interface PorOpcionesConfig {
  opciones: Record<string, number>;
}

export interface PorOpcionesMultiplesConfig {
  precioBase: number;
  minimoUnidades: number;
  opciones: Record<string, Record<string, number>>;
}

// Form data type for creating/editing services in admin panel (nested structure)
export interface ServiceFormData {
  nombre: string;
  descripcion: string;
  modeloDePrecio: PricingModel;
  configuracionPrecios:
    | PaqueteConAdicionalConfig
    | PorOpcionesConfig
    | PorOpcionesMultiplesConfig;
}

// ============================================================================
// USER MANAGEMENT TYPES (ADMIN)
// ============================================================================

export interface CreateUserRequest {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol?: "cliente" | "admin";
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    usuario: User & { passwordTemporal: boolean };
    credenciales: {
      email: string;
      password: string; // Generated password - only shown once!
    };
  };
}

export interface UpdateProfileRequest {
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

export interface ChangeUserRoleRequest {
  rol: "cliente" | "admin";
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface OrderFilters extends PaginationParams {
  estado?: OrderStatus;
  clienteId?: string;
  search?: string;
}

export interface UserFilters extends PaginationParams {
  rol?: "cliente" | "admin";
  activo?: boolean;
  search?: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface SummaryReport {
  totalPedidos: number;
  totalClientes: number;
  totalServicios: number;
  pedidosPendientes: number;
  pedidosEnProceso: number;
  ingresosTotales: number;
}

export interface OrdersByStatusReport {
  desde: string; // YYYY-MM-DD format
  hasta: string; // YYYY-MM-DD format
  totalPedidos: number;
  porEstado: Record<string, {
    cantidad: number;
    pedidos: string[]; // Array of order IDs
  }>;
}

export interface RevenueReport {
  desde: string;
  hasta: string;
  ingresoTotal: number;
  cantidadPedidos: number;
  ingresoPromedio: number;
  ingresosPorMes: Array<{
    mes: string; // Format: "YYYY-MM"
    ingreso: number;
    cantidad: number;
  }>;
}

export interface PopularServicesReport {
  totalServicios: number;
  topServicios: Array<{
    servicioId: string;
    nombre: string;
    cantidad: number; // Number of orders
    ingresoTotal: number;
  }>;
}

export interface ClientStatsReport {
  totalClientes: number; // All users with rol='cliente'
  clientesActivos: number; // Clients with at least one order
  ingresoPromedioPorCliente: number;
  topClientes: Array<{
    clienteId: string;
    nombre: string;
    email: string;
    cantidadPedidos: number;
    ingresoTotal: number;
  }>;
}

// Report API response wrapper
export interface ReportResponse<T> {
  mensaje: string;
  resumen?: T;
  resultado?: T;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  success?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
  statusCode?: number;
}
