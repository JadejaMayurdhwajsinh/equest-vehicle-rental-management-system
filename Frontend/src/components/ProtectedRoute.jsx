import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;