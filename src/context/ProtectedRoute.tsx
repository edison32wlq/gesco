import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type RolOficial } from "./AuthContext"; 

interface ProtectedRouteProps {
  // Roles que tienen permiso para acceder (Opcional)
  allowedRoles?: RolOficial[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Si no hay usuario logueado, redirigir al login
  // Guardamos la ubicación de intento en 'state' para volver después
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si hay roles definidos y el usuario no posee uno de ellos
  if (allowedRoles && !allowedRoles.includes(user?.rol as RolOficial)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Acceso permitido: renderiza las rutas hijas
  return <Outlet />;
};