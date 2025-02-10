import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRoles?: string[]; // Defines the required roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { user, loading } = useAuth(); // Assume we now provide a loading state

  if (loading) {
    return <Loading isLoading={loading} />;
  }

  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" />;
  }

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some(
      (role) => role.toLowerCase() === user.role.toLowerCase()
    )
  ) {
    return <Navigate to="/" />;
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
