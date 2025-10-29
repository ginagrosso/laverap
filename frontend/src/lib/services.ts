// Services API module
import { api } from "./api";
import { Service } from "@/types";

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
 * Get all available laundry services (public endpoint)
 */
export async function getServices(): Promise<Service[]> {
  try {
    const response = await api.get<ServicesResponse>("/servicios");
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

/**
 * Create a new laundry service (admin only)
 * @param serviceData - Service data to create
 * @param token - JWT authentication token
 */
export async function createService(
  serviceData: Partial<Service>,
  token: string
): Promise<Service> {
  try {
    const response = await api.post<ServiceResponse>(
      "/servicios",
      serviceData,
      token
    );
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}
