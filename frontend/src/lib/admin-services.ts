// Admin Services API module
import { api } from "./api";
import { Service, ServiceFormData } from "@/types";

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
 * Get all services including inactive ones (admin only)
 * @param token - JWT authentication token (must be admin)
 */
export async function getAllServices(token: string): Promise<Service[]> {
  try {
    const response = await api.get<ServicesResponse>("/servicios", token);
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
 * @param data - Service form data
 * @param token - JWT authentication token (must be admin)
 */
export async function createService(
  data: ServiceFormData,
  token: string
): Promise<Service> {
  try {
    const response = await api.post<ServiceResponse>("/servicios", data, token);
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

/**
 * Update an existing service (admin only)
 * @param id - Service ID
 * @param data - Updated service form data
 * @param token - JWT authentication token (must be admin)
 */
export async function updateService(
  id: string,
  data: ServiceFormData,
  token: string
): Promise<Service> {
  try {
    const response = await api.put<ServiceResponse>(
      `/servicios/${id}`,
      data,
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
