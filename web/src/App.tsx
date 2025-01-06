import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Deposit from "./pages/Deposit";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import HomePage from "./pages/HomePage";
import Withdraw from "./pages/Withdraw";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BuySellCoin from "./pages/BuySellCoin";
import Navigation from "./components/NavigationBar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";

const App: React.FC = () => {
  const DisplayNavbar: React.FC = () => {
    const location = useLocation();
    const hideNavbarPaths = [
      "/",
      "/login",
      "/register",
      "/reset-password",
      "/reset-password/:token",
      "/about",
    ];
    const showNavbar = !hideNavbarPaths.includes(location.pathname);
    return showNavbar ? <Navigation /> : null;
  };

  return (
    <AuthProvider>
      <Router>
        <DisplayNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute isAuth={true}>
                <Deposit />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute isAuth={true}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/about"
            element={
              <ProtectedRoute isAuth={true}>
                <AboutPage />
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
