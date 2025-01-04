import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/NavigationBar";
import Activity from "./pages/Activity";
import Withdraw from "./pages/Withdraw";
import Profile from "./pages/Profile";
import BuySellCoin from "./pages/BuySellCoin";

const App: React.FC = () => {
  const DisplayNavbar: React.FC = () => {
    const location = useLocation();
    const showNavbar = !["/login", "/register"].includes(location.pathname); // Hide on login/register
    return showNavbar ? <Navigation /> : null;
  };

  return (
    <AuthProvider>
      <Router>
        <DisplayNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/trade"
            element={
              <ProtectedRoute isAuth={true}>
                <BuySellCoin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuth={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute isAuth={true}>
                <Activity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute isAuth={true}>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuth={true}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
