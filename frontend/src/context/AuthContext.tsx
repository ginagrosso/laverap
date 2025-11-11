import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, RegisterData } from "@/types";
import { api, ApiError, setLogoutCallback } from "@/lib/api";
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
  handleApiError: (error: unknown) => void;
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

  // Register logout callback with api.ts for automatic session termination on 401 errors
  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      toast.error("Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.");
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Backend returns: { message: string, data: { usuario: User, token: string } }
      const response = await api.post<{ message: string; data: { usuario: User; token: string } }>(
        "/auth/login",
        credentials
      );

      // Extract token and user from nested structure
      const { token: authToken, usuario } = response.data;

      setToken(authToken);
      setUser(usuario);

      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));

      toast.success(`¡Bienvenido, ${usuario.nombre}!`);
    } catch (error) {
      console.error("Login error:", error);
      
      // Mostrar mensaje específico según el código de error
      if (error instanceof ApiError) {
        // Prioridad 1: Errores de validación (ej: contraseña muy corta)
        if (error.isValidationError() && error.details && error.details.length > 0) {
          toast.error(error.details[0]);
        }
        // Prioridad 2: Email no existe
        else if (error.isEmailNotFound()) {
          toast.error("No existe una cuenta con ese email.");
        }
        // Prioridad 3: Contraseña incorrecta
        else if (error.isInvalidPassword()) {
          toast.error("La contraseña es incorrecta.");
        }
        // Fallback: mensaje del backend
        else {
          toast.error(error.message || "Error al iniciar sesión. Verificá tus credenciales.");
        }
      } else {
        toast.error("Error al iniciar sesión. Verificá tus credenciales.");
      }
      
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Backend returns: { message: string, usuario: User }
      // Note: Register does NOT return a token, so we need to login after registration
      const response = await api.post<{ message: string; usuario: User }>(
        "/auth/register",
        data
      );

      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${response.usuario.nombre}!`);

      // Automatically login after successful registration
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error("Registration error:", error);
      
      // Mostrar mensaje específico según el código de error
      if (error instanceof ApiError) {
        if (error.isEmailAlreadyExists()) {
          toast.error("Ya existe una cuenta con ese email.");
        } else if (error.isValidationError() && error.details && error.details.length > 0) {
          // Mostrar el primer error de validación
          toast.error(error.details[0]);
        } else {
          toast.error(error.message || "Error al crear la cuenta. Intentá nuevamente.");
        }
      } else {
        toast.error("Error al crear la cuenta. Intentá nuevamente.");
      }
      
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

  // Manejo de errores de API - cierra sesión si el token es inválido
  const handleApiError = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized()) {
      // Token inválido o expirado - cerrar sesión automáticamente
      logout();
      toast.error("Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.");
    }
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
    handleApiError,
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
