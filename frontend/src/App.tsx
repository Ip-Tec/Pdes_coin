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
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import WalletPage from "./pages/WalletPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTransaction from "./pages/Admin/AdminTransaction";
import AdminUser from "./pages/Admin/AdminUser";
import Utility from "./pages/Admin/Utility";
import Referrals from "./pages/Admin/Referrals";
import NotFound from "./pages/NotFound";

interface AppProps {
  installPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  onInstall: () => void;
}

const App: React.FC<AppProps> = ({ installPrompt, isInstalled, onInstall }) => {
  const DisplayNavbar: React.FC = () => {
    const location = useLocation();
    
    // Define exact paths where navbar should be hidden
    const hideNavbarPaths = [
      "/",
      "*",
      "/login",
      "/about",
      "/support",
      "/register",
      "/help-center",
      "/reset-password",
      "/forgot-password",
      "/referral/re/:referralCode",
    ];
    // Hide the navbar if:
    // - The path is in the `hideNavbarPaths` array
    // - The path starts with `/referral/re/`
    // - The path is a 404 (not found)
    const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/referral/re/") ||
    location.pathname !== "/" && !hideNavbarPaths.includes(location.pathname) && !location.pathname.startsWith("/");

    return shouldHideNavbar ? null : <Navigation />;
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
            <Route path="/reset-password" element={<ChangePassword />} />
            <Route path="/reset-password/:token" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/referral/re/:referralCode" element={<Register />} />
  
            {/* Protected Routes */}
            <Route path="/deposit" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Deposit /></ProtectedRoute>} />
            <Route path="/trade" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><BuySellCoin /></ProtectedRoute>} />
            <Route path="/trade:action" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><BuySellCoin /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Activity /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Withdraw /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Profile /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute requiredRoles={["USER", "MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><WalletPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/a/dashboard" element={<ProtectedRoute requiredRoles={["MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/a/user" element={<ProtectedRoute requiredRoles={["MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><AdminUser /></ProtectedRoute>} />
            <Route path="/a/transactions" element={<ProtectedRoute requiredRoles={["MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><AdminTransaction /></ProtectedRoute>} />
            <Route path="/a/utility" element={<ProtectedRoute requiredRoles={["MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Utility /></ProtectedRoute>} />
            <Route path="/a/referrals" element={<ProtectedRoute requiredRoles={["MODERATOR", "SUPPORT", "ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"]}><Referrals /></ProtectedRoute>} />
  
            {/* Catch-all 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    );
  };
  
  

  return (
    <AuthProvider>
      <Router>
        {!isInstalled && installPrompt && (
          <div className="sticky top-0 left-0 z-50 w-full bg-slate-100 shadow-lg p-3 flex justify-between flex-wrap gap-2">
            <p className="px-4 py-2 mt-2 text-secondary">
              Install this app for a better experience
            </p>
            <button
              onClick={onInstall}
              className="bg-bgColor text-white px-4 py-2 rounded-md mt-2"
            >
              Install
            </button>
          </div>
        )}
        <AnimatedRoutes />
        <DisplayNavbar />
      </Router>
    </AuthProvider>
  );
};

export default App;
