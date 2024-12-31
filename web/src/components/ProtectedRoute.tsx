import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuth: boolean;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuth, children }) => {
  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
