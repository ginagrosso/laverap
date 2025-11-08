// Admin Orders API module
import { api } from "./api";
import {
  Order,
  OrderStatus,
  OrderFilters,
  PaginatedResponse,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
} from "@/types";

// Legacy response for non-paginated endpoints
interface OrderResponse {
  message?: string;
  data: Order;
  success?: boolean;
}

interface DeleteOrderResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
}

/**
 * Get all orders from all customers with pagination and filters (admin only)
 * @param filters - Optional filters (estado, clienteId, search, page, limit)
 * @param token - JWT authentication token (must be admin)
 * @returns Paginated response with orders and pagination metadata
 */
export async function getAllOrders(
  filters: OrderFilters = {},
  token: string
): Promise<PaginatedResponse<Order>> {
  try {
    const params = new URLSearchParams();
    if (filters.estado) params.append("estado", filters.estado);
    if (filters.clienteId) params.append("clienteId", filters.clienteId);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/orders/all${params.toString() ? `?${params}` : ""}`;
    const response = await api.get<PaginatedResponse<Order>>(endpoint, token);
    return response;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

/**
 * Get a specific order by ID
 * @param id - Order ID
 * @param token - JWT authentication token
 * @returns Order object
 */
export async function getOrderById(id: string, token: string): Promise<Order> {
  try {
    const response = await api.get<OrderResponse>(`/orders/${id}`, token);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
}

/**
 * Update order status (admin or operario)
 * @param id - Order ID
 * @param estado - New order status
 * @param token - JWT authentication token (must be admin or operario)
 * @param observaciones - Optional observations/notes about the status change
 * @returns Updated order
 */
export async function updateOrderStatus(
  id: string,
  estado: OrderStatus,
  token: string,
  observaciones?: string
): Promise<Order> {
  try {
    const body: UpdateOrderStatusRequest = { estado };
    if (observaciones) body.observaciones = observaciones;

    const response = await api.patch<OrderResponse>(
      `/orders/${id}/status`,
      body,
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    throw error;
  }
}

/**
 * Update any field of an order (admin only)
 * Admin can update: servicioId, detalle, observaciones, estado, precioEstimado
 * @param id - Order ID
 * @param data - Fields to update (at least one required)
 * @param token - JWT authentication token (must be admin)
 * @returns Updated order
 */
export async function updateOrder(
  id: string,
  data: UpdateOrderRequest,
  token: string
): Promise<Order> {
  try {
    const response = await api.patch<OrderResponse>(
      `/orders/${id}`,
      data,
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
}

/**
 * Soft delete an order (admin only)
 * Sets activo=false and adds fechaEliminacion
 * @param id - Order ID
 * @param token - JWT authentication token (must be admin)
 */
export async function deleteOrder(id: string, token: string): Promise<void> {
  try {
    await api.delete<DeleteOrderResponse>(`/orders/${id}`, token);
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
}
