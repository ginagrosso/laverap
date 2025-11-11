// Reports API module - Admin only endpoints
import { api } from "./api";
import {
  SummaryReport,
  OrdersByStatusReport,
  RevenueReport,
  PopularServicesReport,
  ClientStatsReport,
  ReportResponse,
} from "@/types";

/**
 * Get summary statistics for admin dashboard
 * @param token - JWT authentication token (must be admin)
 * @returns Summary with total orders, clients, services, and revenue
 */
export async function getSummary(token: string): Promise<SummaryReport> {
  try {
    const response = await api.get<ReportResponse<SummaryReport>>(
      "/reports/summary",
      token
    );
    return response.resumen!;
  } catch (error) {
    console.error("Error fetching summary report:", error);
    throw error;
  }
}

/**
 * Get orders grouped by status with optional date range
 * @param desde - Start date (YYYY-MM-DD format, optional)
 * @param hasta - End date (YYYY-MM-DD format, optional)
 * @param token - JWT authentication token (must be admin)
 * @returns Orders grouped by status
 */
export async function getOrdersByStatus(
  desde?: string,
  hasta?: string,
  token?: string
): Promise<OrdersByStatusReport> {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    const endpoint = `/reports/orders-by-status${params.toString() ? `?${params}` : ""}`;
    const response = await api.get<ReportResponse<OrdersByStatusReport>>(
      endpoint,
      token
    );
    return response.resultado!;
  } catch (error) {
    console.error("Error fetching orders by status report:", error);
    throw error;
  }
}

/**
 * Get revenue statistics with optional date range
 * @param desde - Start date (YYYY-MM-DD format, optional)
 * @param hasta - End date (YYYY-MM-DD format, optional)
 * @param token - JWT authentication token (must be admin)
 * @returns Revenue data including total, average, and breakdown by month
 */
export async function getRevenue(
  desde?: string,
  hasta?: string,
  token?: string
): Promise<RevenueReport> {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    const endpoint = `/reports/revenue${params.toString() ? `?${params}` : ""}`;
    const response = await api.get<ReportResponse<RevenueReport>>(
      endpoint,
      token
    );
    return response.resultado!;
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    throw error;
  }
}

/**
 * Get most popular services ordered by usage
 * @param limite - Maximum number of services to return (1-50, default 10)
 * @param token - JWT authentication token (must be admin)
 * @returns Top services with order count and total revenue
 */
export async function getPopularServices(
  limite: number = 10,
  token: string
): Promise<PopularServicesReport> {
  try {
    const response = await api.get<ReportResponse<PopularServicesReport>>(
      `/reports/popular-services?limite=${limite}`,
      token
    );
    return response.resultado!;
  } catch (error) {
    console.error("Error fetching popular services report:", error);
    throw error;
  }
}

/**
 * Get client statistics including top clients by revenue
 * @param token - JWT authentication token (must be admin)
 * @returns Client stats including total clients, active clients, and top clients
 */
export async function getClientsStats(token: string): Promise<ClientStatsReport> {
  try {
    const response = await api.get<ReportResponse<ClientStatsReport>>(
      "/reports/clients",
      token
    );
    return response.resultado!;
  } catch (error) {
    console.error("Error fetching client stats report:", error);
    throw error;
  }
}
