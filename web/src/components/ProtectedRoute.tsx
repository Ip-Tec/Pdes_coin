import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  isAuth: boolean;
  children: React.ReactElement;
  requiredRoles?: string[]; // This prop defines the required roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuth,
  children,
  requiredRoles = [],
}) => {
  const { user } = useAuth(); // Get the current user from context

  if (!isAuth || !user) {
    return <Navigate to="/login" />;
  }

  // Check if the user has the necessary role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect to home if user does not have access
  }

  return <>{children}</>; // Show the protected content if user has valid role
};

export default ProtectedRoute;
