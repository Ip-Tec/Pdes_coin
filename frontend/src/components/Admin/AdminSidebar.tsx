import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaCoins,
  FaExchangeAlt,
  FaChartLine,
  FaToolbox,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    to: "/a/dashboard",
    icon: FaChartLine,
    label: "Dashboard",
    isAllowed: ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"],
  },
  {
    to: "/a/user",
    icon: FaUser,
    label: "Manage Users",
    isAllowed: ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"],
  },
  {
    to: "/a/transactions",
    icon: FaExchangeAlt,
    label: "Transactions",
    isAllowed: ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"],
  },
  {
    to: "/a/referrals",
    icon: FaCoins,
    label: "Referrals",
    isAllowed: ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER", "MODERATOR", "SUPPORT"],
  },
  {
    to: "/a/utility",
    icon: FaToolbox,
    label: "Utility",
    isAllowed: ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"],
  },
];

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div
      className={`h-screen bg-gray-800 text-white shadow-lg fixed left-0 z-20 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-48"
      }`}
    >
      {/* Logo and Toggle Button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!isCollapsed && <h2 className="text-xl font-bold">Pdes Coin</h2>}
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          <FaBars size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <ul className="mt-4 space-y-2">
        {menuItems
          .filter((item) => user && item.isAllowed.includes(user.role))
          .map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md ${
                  location.pathname === to ? "bg-gray-700" : ""
                }`}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}

        {/* Logout */}
        <li>
          <p
            onClick={logout}
            className="flex items-center text-red-500 gap-4 px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer"
          >
            <FaSignOutAlt size={20} />
            {!isCollapsed && <span>Logout</span>}
          </p>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
