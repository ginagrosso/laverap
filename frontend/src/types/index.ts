// Type definitions based on backend contracts

export type UserRole = "Cliente" | "Administrador" | "Empleado" | "Dueño";

export type OrderStatus = "Recibido" | "En Proceso" | "Listo" | "Entregado";

export type PricingModel = "porCanasto" | "porUnidad";

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
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
  rol?: UserRole;
}

// Service pricing models
export interface ServiceCanastoDetail {
  cantidadPrendasNormales?: number;
  cantidadSabanas2Plazas?: number;
}

export interface ServiceUnidadDetail {
  cantidad: number;
  opciones?: Record<string, string>;
}

export type OrderDetail = ServiceCanastoDetail | ServiceUnidadDetail;

export interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  modeloDePrecio: PricingModel;
  // For porCanasto
  precioPorCanasto?: number;
  itemsPorCanasto?: number;
  minimoItems?: number;
  // For porUnidad
  precioBase?: number;
  minimoUnidades?: number;
  opcionesDePrecio?: Record<string, Record<string, number>>;
}

export interface Order {
  id: string;
  clienteId: string;
  servicio: {
    id: string;
    nombre: string;
  };
  detalle: OrderDetail;
  observaciones?: string;
  precioEstimado: number;
  estado: OrderStatus;
  fechaCreacion: Date | { seconds: number; nanoseconds: number }; // Firestore timestamp
}

export interface CreateOrderRequest {
  servicioId: string;
  detalle: OrderDetail;
  observaciones?: string;
}
