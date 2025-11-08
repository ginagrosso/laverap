// Users API module
import { api } from "./api";
import {
  User,
  CreateUserRequest,
  CreateUserResponse,
  UpdateProfileRequest,
  ChangeUserRoleRequest,
  UserFilters,
  PaginatedResponse,
} from "@/types";

// Backend response wrapper types
interface UserProfileResponse {
  message: string;
  data: User;
}

interface UserActionResponse {
  success: boolean;
  message: string;
  data: User;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Get current user's profile information
 * @param token - JWT authentication token
 * @returns User profile
 */
export async function getMyProfile(token: string): Promise<User> {
  try {
    const response = await api.get<UserProfileResponse>("/users/me", token);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Update current user's profile
 * @param data - Profile data to update (nombre, telefono, direccion)
 * @param token - JWT authentication token
 * @returns Updated user profile
 */
export async function updateMyProfile(
  data: UpdateProfileRequest,
  token: string
): Promise<User> {
  try {
    const response = await api.patch<UserProfileResponse>("/users/me", data, token);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Get all users in the system with pagination and filters (admin only)
 * @param filters - Optional filters (rol, activo, search, page, limit)
 * @param token - JWT authentication token (must be admin)
 * @returns Paginated response with users and pagination metadata
 */
export async function getAllUsers(
  filters: UserFilters = {},
  token: string
): Promise<PaginatedResponse<User>> {
  try {
    const params = new URLSearchParams();
    if (filters.rol) params.append("rol", filters.rol);
    if (filters.activo !== undefined) params.append("activo", filters.activo.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/users${params.toString() ? `?${params}` : ""}`;
    const response = await api.get<PaginatedResponse<User>>(endpoint, token);
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Create a new user (admin only)
 * IMPORTANT: Returns temporary password that must be saved immediately!
 * The password is only shown once and cannot be retrieved later.
 * @param data - User data (nombre, email, telefono?, direccion?, rol?)
 * @param token - JWT authentication token (must be admin)
 * @returns Created user with temporary credentials
 */
export async function createUser(
  data: CreateUserRequest,
  token: string
): Promise<CreateUserResponse> {
  try {
    const response = await api.post<CreateUserResponse>("/users", data, token);
    return response;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Get user by ID (admin only)
 * @param id - User ID
 * @param token - JWT authentication token (must be admin)
 * @returns User object
 */
export async function getUserById(id: string, token: string): Promise<User> {
  try {
    const response = await api.get<UserActionResponse>(`/users/${id}`, token);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
}

/**
 * Change user role (admin only)
 * @param id - User ID
 * @param rol - New role ("cliente" or "admin")
 * @param token - JWT authentication token (must be admin)
 * @returns Updated user
 */
export async function changeUserRole(
  id: string,
  rol: "cliente" | "admin",
  token: string
): Promise<User> {
  try {
    const body: ChangeUserRoleRequest = { rol };
    const response = await api.patch<UserActionResponse>(
      `/users/${id}/role`,
      body,
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error changing role for user ${id}:`, error);
    throw error;
  }
}

/**
 * Deactivate user (admin only)
 * Sets activo=false and adds fechaDesactivacion
 * @param id - User ID
 * @param token - JWT authentication token (must be admin)
 * @returns Deactivated user
 */
export async function deactivateUser(id: string, token: string): Promise<User> {
  try {
    const response = await api.patch<UserActionResponse>(
      `/users/${id}/desactivar`,
      {},
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error deactivating user ${id}:`, error);
    throw error;
  }
}

/**
 * Activate user (admin only)
 * Sets activo=true and removes fechaDesactivacion
 * @param id - User ID
 * @param token - JWT authentication token (must be admin)
 * @returns Activated user
 */
export async function activateUser(id: string, token: string): Promise<User> {
  try {
    const response = await api.patch<UserActionResponse>(
      `/users/${id}/activar`,
      {},
      token
    );
    return response.data;
  } catch (error) {
    console.error(`Error activating user ${id}:`, error);
    throw error;
  }
}

/**
 * Permanently delete user (admin only)
 * This action cannot be undone!
 * Will fail if user has active orders.
 * @param id - User ID
 * @param token - JWT authentication token (must be admin)
 */
export async function deleteUser(id: string, token: string): Promise<void> {
  try {
    await api.delete<DeleteUserResponse>(`/users/${id}`, token);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}
