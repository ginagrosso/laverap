import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse, LoginCredentials, RegisterData } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "laverapp_token";
const USER_KEY = "laverapp_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      setToken(response.token);
      setUser(response.user);

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      toast.success(`¡Bienvenido, ${response.user.nombre}!`);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión. Verificá tus credenciales.");
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);

      setToken(response.token);
      setUser(response.user);

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${response.user.nombre}!`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error al crear la cuenta. Intentá nuevamente.");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.info("Sesión cerrada");
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
