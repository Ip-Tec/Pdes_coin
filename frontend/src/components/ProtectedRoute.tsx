import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuth, loading, roles, getUser } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    // Only try to get user data if not already loading and we haven't exceeded check limit
    if (!isAuth && !loading && !isChecking && checkCount < 2) {
      const fetchUser = async () => {
        setIsChecking(true);
        try {
          await getUser();
        } finally {
          setIsChecking(false);
          setCheckCount(prev => prev + 1);
        }
      };
      fetchUser();
    }
  }, [isAuth, loading, getUser, isChecking, checkCount]);

  // Check for auth token directly
  const hasAuthToken = localStorage.getItem('access_token') !== null;

  if (loading || isChecking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Determine if we should redirect to login
  const shouldRedirectToLogin = !isAuth && !hasAuthToken && checkCount >= 1;
  
  if (shouldRedirectToLogin) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but no auth state yet, show loading
  if (!isAuth && hasAuthToken && checkCount < 2) {
    return <div className="flex justify-center items-center h-screen">Verifying authentication...</div>;
  }

  // Check if user has required role
  if (isAuth && roles && roles.length > 0 && requiredRoles.length > 0) {
    const hasPermission = requiredRoles.some(role => 
      roles.includes(role.toUpperCase()) || roles.includes(role.toLowerCase())
    );
    
    if (!hasPermission) {
      console.log("Insufficient permissions, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated (or we're giving benefit of doubt for token presence)
  return <>{children}</>;
};

export default ProtectedRoute;
