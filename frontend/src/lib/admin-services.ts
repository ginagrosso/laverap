// Admin Services API module
import { api } from "./api";
import { Service, ServiceFormData, CreateServiceRequest } from "@/types";

// Backend response wrapper types
interface ServicesResponse {
  message: string;
  data: Service[];
}

interface ServiceResponse {
  message: string;
  data: Service;
}

/**
 * Maps ServiceFormData (nested structure) to CreateServiceRequest (flat structure)
 * The form uses nested configuracionPrecios, but the backend expects flat fields
 * @param formData - Service form data with nested structure
 * @returns CreateServiceRequest with flat structure for backend
 */
export function mapServiceFormToApiRequest(formData: ServiceFormData): CreateServiceRequest {
  const { nombre, descripcion, modeloDePrecio, configuracionPrecios } = formData;

  const baseRequest: CreateServiceRequest = {
    nombre,
    descripcion,
    modeloDePrecio,
  };

  // Flatten the nested configuracionPrecios based on pricing model
  if (modeloDePrecio === "paqueteConAdicional") {
    const config = configuracionPrecios as { precioBase: number; adicionales: Record<string, number> };
    return {
      ...baseRequest,
      precioBase: config.precioBase,
      adicionales: config.adicionales,
    };
  } else if (modeloDePrecio === "porOpciones") {
    const config = configuracionPrecios as { opciones: Record<string, number> };
    return {
      ...baseRequest,
      opciones: config.opciones,
    };
  } else if (modeloDePrecio === "porOpcionesMultiples") {
    const config = configuracionPrecios as {
      precioBase: number;
      minimoUnidades: number;
      opciones: Record<string, Record<string, number>>;
    };
    return {
      ...baseRequest,
      precioBase: config.precioBase,
      minimoUnidades: config.minimoUnidades,
      opciones: config.opciones,
    };
  }

  return baseRequest;
}

/**
 * Get all services including inactive ones (admin only)
 * @param token - JWT authentication token (must be admin)
 */
export async function getAllServices(token: string): Promise<Service[]> {
  try {
    const response = await api.get<ServicesResponse>("/servicios/all", token);
    return response.data;
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
}

/**
 * Get a specific service by ID
 * @param id - Service ID
 * @param token - JWT authentication token
 */
export async function getServiceById(
  id: string,
  token: string
): Promise<Service> {
  try {
    const response = await api.get<ServiceResponse>(`/servicios/${id}`, token);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new service (admin only)
 * @param data - Service form data (nested structure)
 * @param token - JWT authentication token (must be admin)
 */
export async function createService(
  data: ServiceFormData,
  token: string
): Promise<Service> {
  try {
    // Map nested form data to flat API request structure
    const apiRequest = mapServiceFormToApiRequest(data);
    const response = await api.post<ServiceResponse>("/servicios", apiRequest, token);
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

/**
 * Update an existing service (admin only)
 * @param id - Service ID
 * @param data - Updated service form data (nested structure)
 * @param token - JWT authentication token (must be admin)
 */
export async function updateService(
  id: string,
  data: ServiceFormData,
  token: string
): Promise<Service> {
  try {
    // Map nested form data to flat API request structure
    const apiRequest = mapServiceFormToApiRequest(data);
    const response = await api.put<ServiceResponse>(
      `/servicios/${id}`,
      apiRequest,
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }
}

/**
 * Deactivate a service (soft delete, admin only)
 * @param id - Service ID
 * @param token - JWT authentication token (must be admin)
 */
export async function deactivateService(
  id: string,
  token: string
): Promise<void> {
  try {
    await api.delete<{ message: string }>(`/servicios/${id}`, token);
  } catch (error) {
    console.error(`Error deactivating service ${id}:`, error);
    throw error;
  }
}

/**
 * Activate a previously deactivated service (admin only)
 * @param id - Service ID
 * @param token - JWT authentication token (must be admin)
 */
export async function activateService(
  id: string,
  token: string
): Promise<Service> {
  try {
    const response = await api.patch<ServiceResponse>(
      `/servicios/${id}/activar`,
      {},
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error activating service ${id}:`, error);
    throw error;
  }
}
