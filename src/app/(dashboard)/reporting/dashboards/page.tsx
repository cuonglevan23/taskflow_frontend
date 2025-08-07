"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { DashboardSection, type Dashboard } from "../components";
import { useDashboards } from "../hooks";

// Page Props - Clean interface
interface DashboardsPageProps {
  dateRange?: string;
  userId?: string;
}

// Clean & Optimized Dashboards Page - Using Modular Components
const DashboardsPage: React.FC<DashboardsPageProps> = ({ 
  dateRange,
  userId = 'current-user' 
}) => {
  const { theme } = useTheme();
  const [recentsExpanded, setRecentsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');

  // Use dashboard hook for data management
  const {
    recentDashboards,
    createDashboard,
    isLoading,
    error,
    stats
  } = useDashboards({
    userId,
    filterRecent: true,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  // Event Handlers - Clean & Reusable
  const handleDashboardClick = (dashboard: Dashboard) => {
    console.log('Dashboard clicked:', dashboard.name);
    // In real app: router.push(`/reporting/dashboards/${dashboard.id}`)
  };

  const handleCreateDashboard = async () => {
    try {
      await createDashboard({
        name: "New Dashboard",
        color: "#8b5cf6",
        owner: { id: userId, name: "Văn Lê", initials: "VL" },
        isRecent: true,
      });
      console.log('Dashboard created successfully');
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  const handleViewModeChange = (mode: 'tiles' | 'list') => {
    setViewMode(mode);
  };

  const handleToggleRecents = () => {
    setRecentsExpanded(!recentsExpanded);
  };

  if (error) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <div className="text-center">
          <h3 
            className="text-lg font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            Error Loading Dashboards
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.text.secondary }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-auto"
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div className="p-6">
        {/* Recents Section - Using Modular Component */}
        <DashboardSection
          title="Recents"
          dashboards={recentDashboards}
          viewMode={viewMode}
          isExpanded={recentsExpanded}
          showCreateCard={true}
          showViewToggle={true}
          createLabel="Create dashboard"
          onToggleExpanded={handleToggleRecents}
          onViewModeChange={handleViewModeChange}
          onDashboardClick={handleDashboardClick}
          onCreateClick={handleCreateDashboard}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span 
              className="ml-3"
              style={{ color: theme.text.secondary }}
            >
              Loading dashboards...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recentDashboards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              No dashboards yet
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: theme.text.secondary }}
            >
              Create your first dashboard to get started
            </p>
            <button
              onClick={handleCreateDashboard}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
              }}
            >
              Create Dashboard
            </button>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            className="mt-8 p-4 rounded-lg text-xs"
            style={{ 
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default 
            }}
          >
            <strong>Debug Info:</strong> {stats.total} total, {stats.recent} recent dashboards
            {dateRange && <span> | Period: {dateRange}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardsPage;