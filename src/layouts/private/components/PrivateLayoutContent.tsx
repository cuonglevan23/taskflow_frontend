"use client";

import {
  useLayoutContext,
  useLayoutActions,
} from "../context/PrivateLayoutContext";
import PrivateHeader from "./PrivateHeader";
import PrivateSidebar from "./PrivateSidebar";
import PrivateMain from "./PrivateMain";

interface PrivateLayoutContentProps {
  children: React.ReactNode;
}

export default function PrivateLayoutContent({
  children,
}: PrivateLayoutContentProps) {
  const { user, isSidebarOpen, isSidebarCollapsed } = useLayoutContext();
  const { toggleSidebar, setSidebarOpen, toggleSidebarCollapse } =
    useLayoutActions();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Fixed at top */}
      <PrivateHeader
        user={user!}
        onSidebarToggle={toggleSidebar}
        onSidebarCollapseToggle={toggleSidebarCollapse}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <PrivateSidebar
          user={user!}
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeSidebar}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content - Offset by sidebar width on desktop */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isSidebarCollapsed ? "" : ""
          }`}
        >
          <PrivateMain>{children}</PrivateMain>
        </div>
      </div>
    </div>
  );
}
