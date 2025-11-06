// Type definitions based on backend contracts

export type UserRole = "cliente" | "admin" | "empleado" | "dueño";

export type OrderStatus = "Pendiente" | "En Proceso" | "Finalizado" | "Entregado" | "Cancelado";

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
  observaciones: string | null;
  precioEstimado: number;
  estado: OrderStatus;
  fechaCreacion: Date | string; // Backend should serialize to ISO string
}

export interface CreateOrderRequest {
  servicioId: string;
  detalle: OrderDetail;
  observaciones?: string | null;
}

// Service form data types for admin panel
export interface PaqueteConAdicionalConfig {
  precioBase: number;
  adicionales: Record<string, number>; // e.g., { "planchado": 50 }
}

export interface PorOpcionesConfig {
  opciones: Record<string, number>; // e.g., { "express": 100, "normal": 50 }
}

export interface PorOpcionesMultiplesConfig {
  precioBase: number;
  minimoUnidades: number;
  opciones: Record<string, Record<string, number>>; // e.g., { "tamaño": { "grande": 50, "pequeño": 30 } }
}

export interface ServiceFormData {
  nombre: string;
  descripcion: string;
  modeloDePrecio: "paqueteConAdicional" | "porOpciones" | "porOpcionesMultiples";
  configuracionPrecios: PaqueteConAdicionalConfig | PorOpcionesConfig | PorOpcionesMultiplesConfig;
  activo?: boolean;
}
