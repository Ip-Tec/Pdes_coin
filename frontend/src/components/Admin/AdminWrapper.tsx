import React, { ReactNode, useState } from "react";
import AdminTopbar from "./Topbar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface AdminWrapperProps {
  children: ReactNode;
}

const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const { isAuth } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? "4rem" : "10rem";
  // console.log({ isAuth });

  if (!isAuth) {
    return Navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Topbar */}
      <AdminTopbar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <div
        className="w-full flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Sidebar */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        {/* Content Area */}
        <main className="p-4 overflow-auto ">{children}</main>
      </div>
    </div>
  );
};

export default AdminWrapper;
