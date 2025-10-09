// API client configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
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
    throw new ApiError(
      response.status,
      data?.message || `Request failed with status ${response.status}`,
      data
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
