import { Navigate } from 'react-router-dom';
import type { JSX } from 'react/jsx-dev-runtime';

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(userString);
  if (user.role !== 'admin') {
    alert("Acesso Negado: Área restrita para Administradores.");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}