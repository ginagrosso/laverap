// Users API module
import { api } from "./api";
import { User } from "@/types";

// Backend response wrapper types
interface UserProfileResponse {
  message: string;
  data: User;
}

interface UsersListResponse {
  data: User[]; // Note: No message field for this endpoint
}

/**
 * Get current user's profile information
 * @param token - JWT authentication token
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
 * Get all users in the system (admin only)
 * @param token - JWT authentication token (must have admin role)
 */
export async function getAllUsers(token: string): Promise<User[]> {
  try {
    const response = await api.get<UsersListResponse>("/users", token);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
