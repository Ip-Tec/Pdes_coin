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
  FaChevronDown,
  FaUserEdit,
  FaWallet,
  FaHistory,
  FaDatabase,
  FaFileUpload,
  FaFileDownload,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SidebarItemProps {
  to: string;
  icon?: React.ComponentType<{ size: number }>;
  label: string;
  isCollapsed: boolean;
}

interface DropdownItemProps {
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
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-800 text-white shadow-lg overflow-y-scroll no-scrollbar pb-36 fixed left-0 z-20 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-48"
      }`}
    >
      {/* Logo and Toggle Button */}
      <div className="flex items-center bg-gray-800 justify-between px-4 py-4 border-b sticky top-0 border-gray-700">
        {!isCollapsed && <h2 className="text-xl font-bold">Pdes Coin</h2>}
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          <FaBars size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <ul className="mt-8 space-y-2 relative">
        <SidebarItem
          to="/a/dashboard"
          icon={FaChartLine}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />

        <DropdownItem
          label="Users"
          icon={FaUser}
          isOpen={isUserDropdownOpen}
          setIsOpen={setIsUserDropdownOpen}
          isCollapsed={isCollapsed}
          childrenItems={[
            { to: "/a/user", icon: FaUserEdit, label: "Manage Users" },
            {
              to: "/a/user/transaction",
              icon: FaHistory,
              label: "User Transactions",
            },
            { to: "/a/user/deposit", icon: FaWallet, label: "User Deposits" },
          ]}
        />

        <DropdownItem
          label="Transactions"
          icon={FaExchangeAlt}
          isOpen={isTransactionOpen}
          setIsOpen={setIsTransactionOpen}
          isCollapsed={isCollapsed}
          childrenItems={[
            {
              to: "/a/transactions/confirm-deposit",
              icon: FaWallet,
              label: "Confirm Deposit",
            },
            {
              to: "/a/transactions/history",
              icon: FaHistory,
              label: "History",
            },
          ]}
        />

        <SidebarItem
          to="/a/referrals"
          icon={FaCoins}
          label="Referrals"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/a/utility"
          icon={FaToolbox}
          label="Utility"
          isCollapsed={isCollapsed}
        />

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

        <li className="absolute -bottom-40 w-full">
          <p
            onClick={e => {
              e.preventDefault();
              logout();
            }}
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

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarItemProps) => {
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

const DropdownItem = ({
  label,
  icon: Icon,
  isOpen,
  setIsOpen,
  isCollapsed,
  childrenItems,
}: DropdownItemProps) => {
  return (
    <li>
      <div
        className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={20} />
        {!isCollapsed &&
          (label === "Users" ? (
            <Link to="/a/user">Users</Link>
          ) : (
            <span>{label}</span>
          ))}
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
