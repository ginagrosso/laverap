// API client configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public details?: string[],
    public code?: string
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

  getCode(): string | undefined {
    return this.code;
  }

  // Auth error helpers
  isEmailNotFound(): boolean {
    return this.code === 'AUTH_003';
  }

  isInvalidPassword(): boolean {
    return this.code === 'AUTH_004';
  }

  isEmailAlreadyExists(): boolean {
    return this.code === 'AUTH_005' || this.code === 'USER_003';
  }

  // Service error helpers
  isServiceNotFound(): boolean {
    return this.code === 'SERVICE_001';
  }

  isServiceNameAlreadyExists(): boolean {
    return this.code === 'SERVICE_006';
  }

  // Order error helpers
  isOrderNotFound(): boolean {
    return this.code === 'ORDER_001';
  }

  isInvalidService(): boolean {
    return this.code === 'ORDER_002';
  }

  // User error helpers
  isUserNotFound(): boolean {
    return this.code === 'USER_001';
  }

  // Validation error helper
  isValidationError(): boolean {
    return this.code === 'VALIDATION_001' || this.code === 'VALIDATION_002';
  }
}

// Global logout callback for automatic session termination on 401 errors
let logoutCallback: (() => void) | null = null;

/**
 * Register logout callback to be called when token expires (401 error)
 * Should be called from AuthContext on initialization
 */
export function setLogoutCallback(callback: () => void): void {
  logoutCallback = callback;
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
    const errorCode = data?.error?.code;

    // Automatic logout on 401 (token expired or invalid)
    if (response.status === 401 && logoutCallback) {
      logoutCallback();
    }

    throw new ApiError(
      response.status,
      errorMessage,
      data,
      errorDetails,
      errorCode
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
 * Returns main message, optional detail list, and error code
 */
export function formatApiError(error: unknown): { 
  message: string; 
  details: string[];
  code?: string;
} {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      details: error.getDetails(),
      code: error.getCode(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: [],
    };
  }

  return {
    message: "Ocurrió un error inesperado",
    details: [],
  };
}
