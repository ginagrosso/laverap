// Type definitions based on backend contracts

export type UserRole = "Cliente" | "Administrador" | "Empleado" | "Dueño";

export type OrderStatus = "Recibido" | "En Proceso" | "Listo" | "Entregado";

export type PricingModel =
  | "porCanasto"
  | "porUnidad"
  | "paqueteConAdicional"
  | "porOpciones"
  | "porOpcionesMultiples";

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

// Order detail structures for different pricing models
export interface PaqueteConAdicionalDetail {
  cantidad: number;
  incluyePlanchado?: boolean;
}

export interface PorOpcionesMultiplesDetail {
  cantidad: number;
  opciones: Record<string, string>; // e.g., { "tamaño": "grande", "tipo": "delicado" }
}

export interface PorOpcionesDetail {
  cantidad: number;
  opcion: string; // e.g., "express"
}

export type OrderDetail =
  | PaqueteConAdicionalDetail
  | PorOpcionesMultiplesDetail
  | PorOpcionesDetail;

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

  // For paqueteConAdicional
  adicionales?: Record<string, number>; // e.g., { "planchado": 50 }

  // For porOpciones
  opciones?: Record<string, number | Record<string, number>>; // Can be flat or nested
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
