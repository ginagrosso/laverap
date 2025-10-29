// Orders API module
import { api } from "./api";
import { Order, CreateOrderRequest } from "@/types";

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
 * Create a new order for the authenticated user
 * @param orderData - Order data (servicioId, detalle, observaciones)
 * @param token - JWT authentication token
 */
export async function createOrder(
  orderData: CreateOrderRequest,
  token: string
): Promise<Order> {
  try {
    const response = await api.post<OrderResponse>(
      "/orders",
      orderData,
      token
    );
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get all orders for the authenticated user
 * @param token - JWT authentication token
 */
export async function getMyOrders(token: string): Promise<Order[]> {
  try {
    const response = await api.get<OrdersResponse>("/orders", token);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}
