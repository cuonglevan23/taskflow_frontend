import { ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/navigation/Sidebar';
import { TopBar } from '@/components/organisms/navigation/TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showTopBar?: boolean;
}

export default function DashboardLayout({
  children,
  showSidebar = true,
  showTopBar = true,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        {showTopBar && <TopBar />}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
