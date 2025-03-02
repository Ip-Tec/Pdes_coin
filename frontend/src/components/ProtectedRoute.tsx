import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuth, loading, roles, getUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Try to get user data if we're not authenticated but not in a loading state
    if (!isAuth && !loading) {
      getUser();
    }
  }, [isAuth, loading, getUser]);

  if (loading) {
    // Show loading state
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasPermission = requiredRoles.some(role => roles.includes(role));
  
  if (!hasPermission) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
