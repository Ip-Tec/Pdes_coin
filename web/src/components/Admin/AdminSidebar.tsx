import { Link } from "react-router-dom";
import {
  FaUser,
  FaCoins,
  FaExchangeAlt,
  FaChartLine,
  FaCog,
  FaToolbox,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const { logout } = useAuth();

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
        <li>
          <Link
            to="/a/dashboard"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaChartLine size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/a/user"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaUser size={20} />
            {!isCollapsed && <span>Manage Users</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/a/transactions"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaExchangeAlt size={20} />
            {!isCollapsed && <span>Transactions</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/a/referrals"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaCoins size={20} />
            {!isCollapsed && <span>Referrals</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/a/settings"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaCog size={20} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/a/utility"
            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md"
          >
            <FaToolbox size={20} />
            {!isCollapsed && <span>Utility</span>}
          </Link>
        </li>
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
