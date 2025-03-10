import AdminTopbar from "./Topbar";
import AdminSidebar from "./AdminSidebar";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import React, { ReactNode, useEffect, useState } from "react";

interface AdminWrapperProps {
  children: ReactNode;
}

const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const { isAuth } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Collapse sidebar by default on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // Run on mount to set initial state
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isSidebarCollapsed ? "4rem" : "10rem";
  // console.log({ isAuth });

  if (!isAuth) {
    return Navigate({ to: "/login" });
  }

  return (
    <div className="flex w-screen md:w-lvw mg:max-w-xl overflow-hidden">
      {/* Topbar */}
      <AdminTopbar isSidebarCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Sidebar */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        {/* Content Area */}
        <main
          className="flex-1 md:p-4 overflow-auto "
          style={{ width: `calc(100vw - ${sidebarWidth})` }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminWrapper;
