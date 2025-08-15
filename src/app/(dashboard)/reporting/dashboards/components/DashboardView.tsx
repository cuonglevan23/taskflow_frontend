"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Plus } from "lucide-react";
import { Dashboard } from "./index";
import { Chart } from "../hooks/useChartModal";
import { useChartModal } from "../hooks/useChartModal";
import { ChartSelectModal, ChartConfigModal } from "./index";
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

/* ===================== Types ===================== */
interface DashboardViewProps {
  dashboard: Dashboard;
  charts: Chart[];
  onAddChart: (chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onRemoveChart: (chartId: string) => Promise<void>;
  onUpdateChart: (chartId: string, updates: Partial<Chart>) => Promise<void>;
  onUpdateDashboard: (updates: Partial<Dashboard>) => Promise<void>;
}

/* ===================== Main Component ===================== */
export default function DashboardView({
  dashboard,
  charts,
  onAddChart,
  onRemoveChart,
  onUpdateChart,
  onUpdateDashboard
}: DashboardViewProps) {
  const { theme } = useTheme();
  
  // Chart modal management
  const {
    isSelectModalOpen,
    isConfigModalOpen,
    selectedChartType,
    openSelectModal,
    closeSelectModal,
    openConfigModal,
    closeConfigModal,
  } = useChartModal();

  // Handle adding chart from modal
  const handleAddChart = async (chartConfig: any) => {
    await onAddChart(chartConfig);
  };

  // Render chart component based on type
  const renderChart = (chart: Chart) => {
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

  return (
    <div className="">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-6">
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
          }}
        >
          <h3 
            className="text-sm font-medium"
            style={{ color: theme.text.secondary }}
          >
            Total Charts
          </h3>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color: theme.text.primary }}
          >
            {charts.length}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
          }}
        >
          <h3 
            className="text-sm font-medium"
            style={{ color: theme.text.secondary }}
          >
            Last Updated
          </h3>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color: theme.text.primary }}
          >
            {dashboard.updatedAt.toLocaleDateString()}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
          }}
        >
          <h3 
            className="text-sm font-medium"
            style={{ color: theme.text.secondary }}
          >
            Owner
          </h3>
          <p 
            className="text-2xl font-bold mt-1"
            style={{ color: theme.text.primary }}
          >
            {dashboard.owner.initials}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6 px-6">
          <h2 
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            Charts
          </h2>
          <button
            onClick={openSelectModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Chart</span>
          </button>
        </div>

        {/* Charts Grid - Full Width */}
        {charts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {charts.map((chart) => (
              <div key={chart.id} className="relative group">
                {/* Chart Actions */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onUpdateChart(chart.id, { title: `${chart.title} (Updated)` })}
                      className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      title="Edit chart"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemoveChart(chart.id)}
                      className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Remove chart"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Chart Component */}
                {renderChart(chart)}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div 
            className="text-center py-12 border-2 border-dashed rounded-lg"
            style={{ borderColor: theme.border.default }}
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              No charts yet
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: theme.text.secondary }}
            >
              Add your first chart to start visualizing data
            </p>
            <button
              onClick={openSelectModal}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
              }}
            >
              Add Chart
            </button>
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
        onSave={handleAddChart}
      />
    </div>
  );
}