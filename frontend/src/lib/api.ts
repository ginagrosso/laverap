// API client configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public details?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  getDetails(): string[] {
    return this.details || [];
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Backend error format: { success: false, error: { code, message, details? } }
    const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const errorDetails = data?.error?.details;

    throw new ApiError(
      response.status,
      errorMessage,
      data,
      errorDetails
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: "DELETE", token }),
};

export { API_BASE_URL };

/**
 * Format API error for display to user
 * Returns main message and optional detail list
 */
export function formatApiError(error: unknown): { message: string; details: string[] } {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      details: error.getDetails(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: [],
    };
  }

  return {
    message: "An unexpected error occurred",
    details: [],
  };
}
