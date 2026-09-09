import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-login-wrap">
        <div className="spinner" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (admin && admin.forcePasswordChange && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />;
  }

  return children;
}