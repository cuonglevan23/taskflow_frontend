"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { DashboardSection, type Dashboard } from "../components";
import { useDashboards } from "../hooks";
import { ChartSelectModal, ChartConfigModal } from "./components";
import { useChartModal } from "./hooks/useChartModal";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  DonutChart, 
  AreaChart, 
  RadarChart, 
  PolarAreaChart,
  ScatterChart,
  BubbleChart
} from "@/components/Chart";

// Page Props - Clean interface
interface DashboardsPageProps {
  dateRange?: string;
  userId?: string;
}

// Clean & Optimized Dashboards Page - Using Modular Components
export default function DashboardsPage({ 
  dateRange,
  userId = 'current-user' 
}: DashboardsPageProps) {
  const { theme } = useTheme();
  const [recentsExpanded, setRecentsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');

  // Chart modal management
  const {
    isSelectModalOpen,
    isConfigModalOpen,
    selectedChartType,
    charts,
    openSelectModal,
    closeSelectModal,
    openConfigModal,
    closeConfigModal,
    addChart,
    removeChart,
  } = useChartModal();

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
    // Navigate to specific dashboard
    window.location.href = `/reporting/dashboards/${dashboard.id}`;
  };

  const handleCreateDashboard = async () => {
    // Open chart selection modal first
    openSelectModal();
  };

  const handleViewModeChange = (mode: 'tiles' | 'list') => {
    setViewMode(mode);
  };

  const handleToggleRecents = () => {
    setRecentsExpanded(!recentsExpanded);
  };

  // Render chart component based on type
  const renderChart = (chart: any) => {
    const commonProps = {
      data: chart.data,
      title: chart.title,
      height: chart.height,
      showLegend: chart.showLegend,
    };

    switch (chart.type) {
      case 'bar':
        return <BarChart key={chart.id} {...commonProps} />;
      case 'line':
        return <LineChart key={chart.id} {...commonProps} datasets={[{ label: 'Dataset', data: chart.data }]} />;
      case 'pie':
        return <PieChart key={chart.id} {...commonProps} />;
      case 'donut':
        return <DonutChart key={chart.id} {...commonProps} />;
      case 'area':
        return <AreaChart key={chart.id} {...commonProps} datasets={[{ label: 'Dataset', data: chart.data }]} />;
      case 'radar':
        return <RadarChart key={chart.id} {...commonProps} datasets={[{ label: 'Dataset', data: chart.data }]} />;
      case 'polar':
        return <PolarAreaChart key={chart.id} {...commonProps} />;
      case 'scatter':
        return <ScatterChart key={chart.id} {...commonProps} datasets={[{ label: 'Dataset', data: chart.data }]} />;
      case 'bubble':
        return <BubbleChart key={chart.id} {...commonProps} datasets={[{ label: 'Dataset', data: chart.data }]} />;
      default:
        return <div key={chart.id}>Chart type not supported</div>;
    }
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
              onClick={openSelectModal}
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

        {/* Charts Section */}
        {charts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-xl font-semibold"
                style={{ color: theme.text.primary }}
              >
                Dashboard Charts
              </h2>
              <button
                onClick={openSelectModal}
                className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Chart</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart) => (
                <div key={chart.id} className="relative group">
                  <button
                    onClick={() => removeChart(chart.id)}
                    className="absolute top-2 right-2 z-10 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                    }}
                    title="Remove chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {renderChart(chart)}
                </div>
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Chart Selection Modal */}
      <ChartSelectModal 
        isOpen={isSelectModalOpen}
        onClose={closeSelectModal}
        onSelectChart={openConfigModal}
      />

      {/* Chart Configuration Modal */}
      <ChartConfigModal
        isOpen={isConfigModalOpen}
        chartType={selectedChartType}
        onClose={closeConfigModal}
        onSave={addChart}
      />
    </div>
  );
};

