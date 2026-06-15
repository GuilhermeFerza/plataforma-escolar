// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Turmas from './pages/Turmas';
import Alunos from './pages/Alunos';
import Admin from './pages/Admin';
import ProtectedRoute from './utils/ProtectedRoute';
import AdminRoute from './utils/AdminRoute';
import Agendamentos from './pages/Agendamentos';
import Materias from './pages/Materias';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cursos" 
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/turmas" 
          element={
            <ProtectedRoute>
              <Turmas />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/alunos" 
          element={
            <ProtectedRoute>
              <Alunos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agendamentos" 
          element={
            <ProtectedRoute>
              <Agendamentos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/materias" 
          element={
            <ProtectedRoute>
              <Materias />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}