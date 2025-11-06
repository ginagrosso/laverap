// Admin Orders API module
import { api } from "./api";
import { Order, OrderStatus } from "@/types";

// Backend response wrapper types
interface OrdersResponse {
  message: string;
  data: Order[];
}

interface OrderResponse {
  message: string;
  data: Order;
}

/**
 * Get all orders from all customers (admin only)
 * @param token - JWT authentication token (must be admin)
 */
export async function getAllOrders(token: string): Promise<Order[]> {
  try {
    const response = await api.get<OrdersResponse>("/orders/all", token);
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

/**
 * Get a specific order by ID
 * @param id - Order ID
 * @param token - JWT authentication token
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
 * Update order status (admin only)
 * @param id - Order ID
 * @param estado - New order status
 * @param token - JWT authentication token (must be admin)
 */
export async function updateOrderStatus(
  id: string,
  estado: OrderStatus,
  token: string
): Promise<Order> {
  try {
    const response = await api.patch<OrderResponse>(
      `/orders/${id}/status`,
      { estado },
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    throw error;
  }
}
