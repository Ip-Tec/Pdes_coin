import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import WalletPage from "./pages/WalletPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTransaction from "./pages/Admin/AdminTransaction";
import AdminUser from "./pages/Admin/AdminUser";
import Utility from "./pages/Admin/Utility";

const App: React.FC = () => {
  const DisplayNavbar: React.FC = () => {
    const location = useLocation();
    const hideNavbarPaths = [
      "/",
      "/login",
      "/about",
      "/support",
      "/register",
      "/help-center",
      "/reset-password",
      "/forgot-password",
      "/referral/re/:referralCode",
    ];
    return hideNavbarPaths.includes(location.pathname) ? null : <Navigation />;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/referral/re/:referralCode" element={<Register />} />
            <Route
              path="/deposit"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Deposit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <BuySellCoin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Activity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/withdraw"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Withdraw />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <AboutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help-center"
              element={
                <ProtectedRoute
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <HelpCenterPage />
                </ProtectedRoute>
              }
            />
            {/* Admin routes */}
            <Route
              path="/a/dashboard"
              element={
                <ProtectedRoute
                  requiredRoles={["admin", "super_admin", "developer"]}
                >
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/a/user"
              element={
                <ProtectedRoute
                  requiredRoles={["admin", "super_admin", "developer"]}
                >
                  <AdminUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/a/transactions"
              element={
                <ProtectedRoute
                  requiredRoles={["admin", "super_admin", "developer"]}
                >
                  <AdminTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/a/utility"
              element={
                <ProtectedRoute requiredRoles={["super_admin", "developer"]}>
                  <Utility />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <DisplayNavbar />
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
