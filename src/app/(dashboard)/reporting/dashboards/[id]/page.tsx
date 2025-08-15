"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/layouts/hooks/useTheme";
import { ArrowLeft, Edit3, Share2, MoreHorizontal } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import DashboardView from "../components/DashboardView";

/* ===================== Types ===================== */
interface DashboardPageProps {
  params: {
    id: string;
  };
}

/* ===================== Main Component ===================== */
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const dashboardId = params?.id as string;

  // Fetch dashboard data
  const {
    dashboard,
    charts,
    isLoading,
    error,
    updateDashboard,
    addChart,
    removeChart,
    updateChart
  } = useDashboard(dashboardId);

  const handleBack = () => {
    router.push('/reporting/dashboards');
  };

  const handleEdit = () => {
    // Open edit dashboard modal
    console.log('Edit dashboard:', dashboardId);
  };

  const handleShare = () => {
    // Open share modal
    console.log('Share dashboard:', dashboardId);
  };

  const handleMore = () => {
    // Open more options menu
    console.log('More options for dashboard:', dashboardId);
  };

  if (isLoading) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: theme.text.secondary }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
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
            Dashboard Not Found
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: theme.text.secondary }}
          >
            {error || `Dashboard with ID "${dashboardId}" does not exist.`}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
            }}
          >
            Back to Dashboards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: theme.background.secondary }}
    >
      {/* Dynamic Header with Dashboard Title */}
      <div 
        className="p-6"
        style={{ 
          backgroundColor: theme.background.primary
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={handleBack}
            className="text-sm transition-colors hover:underline"
            style={{ color: theme.text.secondary }}
          >
            Reporting
          </button>
          <span style={{ color: theme.text.secondary }}>{'>'}</span>
          <button
            onClick={handleBack}
            className="text-sm transition-colors hover:underline"
            style={{ color: theme.text.secondary }}
          >
            Dashboards
          </button>
        </div>

        {/* Dashboard Title Section */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: theme.text.primary }}
            >
              {dashboard.name}
            </h1>
            {dashboard.description && (
              <p 
                className="text-lg"
                style={{ color: theme.text.secondary }}
              >
                {dashboard.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-6">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm"
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`,
              }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm"
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`,
              }}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={handleMore}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`,
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Full Width */}
      <div className="flex-1 overflow-auto">
        <DashboardView
          dashboard={dashboard}
          charts={charts}
          onAddChart={addChart}
          onRemoveChart={removeChart}
          onUpdateChart={updateChart}
          onUpdateDashboard={updateDashboard}
        />
      </div>


    </div>
  );
}