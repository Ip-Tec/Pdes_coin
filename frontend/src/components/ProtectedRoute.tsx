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
    // Only try to get user data if not already loading
    if (!isAuth && !loading) {
      // Use a non-state variable to prevent multiple calls
      const fetchUser = async () => {
        await getUser();
      };
      fetchUser();
    }
  }, [isAuth, loading, getUser]);

  if (loading) {
    // Show loading state
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated and not loading, redirect to login
  if (!isAuth) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role - if roles array is available
  if (roles && roles.length > 0) {
    const hasPermission = requiredRoles.some(role => 
      roles.includes(role.toUpperCase()) || roles.includes(role.toLowerCase())
    );
    
    if (!hasPermission) {
      console.log("Insufficient permissions, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
