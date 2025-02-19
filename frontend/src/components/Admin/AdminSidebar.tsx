import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaUser,
  FaCoins,
  FaExchangeAlt,
  FaChartLine,
  FaToolbox,
  FaSignOutAlt,
  FaBars,
  FaDatabase,
  FaChevronDown,
  FaFileUpload,
  FaFileDownload,
  FaMoneyCheckAlt,
  FaHistory,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-800 text-white shadow-lg top-px fixed left-0 z-20 transition-all duration-300 ${
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
        {/* Dashboard */}
        <SidebarItem
          to="/a/dashboard"
          icon={FaChartLine}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />

        {/* Manage Users */}
        <SidebarItem
          to="/a/user"
          icon={FaUser}
          label="Manage Users"
          isCollapsed={isCollapsed}
        />

        {/* Transactions Dropdown */}
        <DropdownItem
          label="Transactions"
          icon={FaExchangeAlt}
          isOpen={isTransactionOpen}
          setIsOpen={setIsTransactionOpen}
          isCollapsed={isCollapsed}
          childrenItems={[
            {
              to: "/a/transactions/",
              // to: "/a/transactions/confirm-deposit",
              icon: FaMoneyCheckAlt,
              label: "Confirm Deposit",
            },
            {
              to: "/a/transactions",
              // to: "/a/transactions/history",
              icon: FaHistory,
              label: "History",
            },
          ]}
        />

        {/* Referrals */}
        <SidebarItem
          to="/a/referrals"
          icon={FaCoins}
          label="Referrals"
          isCollapsed={isCollapsed}
        />

        {/* Utility */}
        <SidebarItem
          to="/a/utility"
          icon={FaToolbox}
          label="Utility"
          isCollapsed={isCollapsed}
        />

        {/* Data Upload/Download Dropdown */}
        <DropdownItem
          label="Data"
          icon={FaDatabase}
          isOpen={isDataOpen}
          setIsOpen={setIsDataOpen}
          isCollapsed={isCollapsed}
          childrenItems={[
            { to: "/a/data/upload", icon: FaFileUpload, label: "Upload Data" },
            {
              to: "/a/data/download",
              icon: FaFileDownload,
              label: "Download Data",
            },
          ]}
        />

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

/** Sidebar Item (for single navigation items) */
const SidebarItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
}: {
  to: string;
  icon?: React.ComponentType<{ size: number }>;
  label: string;
  isCollapsed: boolean;
}) => {
  const location = useLocation();
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md ${
          location.pathname === to ? "bg-gray-700" : ""
        }`}
      >
        {Icon && <Icon size={20} />}
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </li>
  );
};

/** Dropdown Menu Component */
const DropdownItem = ({
  label,
  icon: Icon,
  isOpen,
  setIsOpen,
  isCollapsed,
  childrenItems,
}: {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  childrenItems: {
    to: string;
    icon: React.ComponentType<{ size: number }>;
    label: string;
  }[];
}) => {
  return (
    <li>
      <div
        className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={20} />
        {!isCollapsed && <span>{label}</span>}
        {!isCollapsed && (
          <FaChevronDown
            className={`ml-auto transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
      {isOpen && (
        <ul className="ml-6 space-y-1">
          {childrenItems.map(({ to, icon: ChildIcon, label }) => (
            <SidebarItem
              key={to}
              to={to}
              icon={ChildIcon}
              label={label}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default AdminSidebar;
