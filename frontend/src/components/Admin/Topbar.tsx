import { FaUserCircle, FaBell } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

interface AdminTopbarProps {
  isSidebarCollapsed: boolean;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ isSidebarCollapsed }) => {
  const { user } = useAuth();
  return (
    <div
      className={`fixed top-0 left-0 h-16 flex items-center z-10 justify-end bg-gray-800
         text-white shadow-md transition-all duration-300 ${
           isSidebarCollapsed ? "pl-16" : "pl-64"
         } pr-4 w-full`}
    >
      {/* Notifications and Profile */}
      <div className="flex items-left gap-6">
        {/* Notifications */}
        <div className="relative">
          <FaBell size={24} className="cursor-pointer hover:text-gray-300" />
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 block h-3 w-3 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
          <FaUserCircle size={30} />
          <span className="hidden sm:inline-block">{(user?.role || "").toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
