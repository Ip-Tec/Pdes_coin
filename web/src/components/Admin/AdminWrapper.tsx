import React, { ReactNode, useState } from "react";
import AdminTopbar from "./Topbar";
import AdminSidebar from "./AdminSidebar";

interface AdminWrapperProps {
  children: ReactNode;
}

const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? "4rem" : "10rem";

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
