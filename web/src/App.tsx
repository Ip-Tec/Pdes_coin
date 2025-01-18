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
import ForgotPassword from "./pages/ForgotPassword";
import AboutPage from "./pages/AboutPage";
import { AnimatePresence, motion } from "framer-motion";
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
      "/register",
      "/reset-password",
      "/reset-password/:token",
      "/forgot-password",
      "/about",
      "/support",
      "help-center",
    ];
    const showNavbar = !hideNavbarPaths.includes(location.pathname);
    return showNavbar ? <Navigation /> : null;
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.5 } },
  };

  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <HomePage />
              </motion.div>
            }
          />
          <Route
            path="/deposit"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Deposit />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/trade"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <BuySellCoin />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Dashboard />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/activity"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Activity />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/withdraw"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Withdraw />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <Profile />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/reset-password"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ResetPassword />
              </motion.div>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ResetPassword />
              </motion.div>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ForgotPassword />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/register"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Register />
              </motion.div>
            }
          />
          <Route
            path="/referral/re/:referralCode"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <Register />
              </motion.div>
            }
          />
          <Route
            path="/about"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <AboutPage />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/wallet"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <WalletPage />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/support"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <SupportPage />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/help-center"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
              >
                <ProtectedRoute
                  isAuth={true}
                  requiredRoles={["user", "admin", "super_admin", "developer"]}
                >
                  <HelpCenterPage />
                </ProtectedRoute>
              </motion.div>
            }
          />
          {/* Admin routes */}
          <Route
            path="/a/dashboard"
            element={
              <ProtectedRoute
                isAuth={true}
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
                isAuth={true}
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
                isAuth={true}
                requiredRoles={["admin", "super_admin", "developer"]}
              >
                <AdminTransaction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/a/utility"
            element={
              <ProtectedRoute
                isAuth={true}
                requiredRoles={["super_admin", "developer"]}
              >
                <Utility />
              </ProtectedRoute>
            }
          />
        </Routes>
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
