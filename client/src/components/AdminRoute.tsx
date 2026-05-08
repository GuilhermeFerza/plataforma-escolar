import { Navigate } from 'react-router-dom';
import type { JSX } from 'react/jsx-dev-runtime';

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // Se não tem token ou não tem dados do usuário, manda pro login
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  // Transforma o texto do LocalStorage de volta em Objeto Javascript
  const user = JSON.parse(userString);

  // Se o usuário não for admin, manda ele de volta pro dashboard
  if (user.role !== 'admin') {
    alert("Acesso Negado: Área restrita para Administradores.");
    return <Navigate to="/dashboard" replace />;
  }

  // Se for admin, libera a entrada!
  return children;
}