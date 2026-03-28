import { createContext, useContext, useState, type ReactNode } from "react";

// 1. Exportamos el tipo de forma independiente
export type RolOficial = "superadmin" | "administrador" | "usuario" | "asesor";

export interface User {
  id?: string | number;
  username: string;
  email: string; 
  rol: RolOficial;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialización síncrona: Lee el localStorage antes del primer renderizado
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("gesco_session");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error parseando la sesión:", error);
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("gesco_session", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gesco_session");
    // Limpieza total regresando al login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      loading: false 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};