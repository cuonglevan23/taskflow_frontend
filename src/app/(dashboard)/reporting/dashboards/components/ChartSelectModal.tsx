"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { BaseModal } from "@/components/ui";

/* ===================== Types ===================== */
export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'donut' 
  | 'area' 
  | 'radar' 
  | 'polar' 
  | 'scatter' 
  | 'bubble';

interface ChartOption {
  type: ChartType;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'advanced';
}

interface ChartSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChart: (type: ChartType) => void;
}

/* ===================== Chart Options ===================== */
const CHART_OPTIONS: ChartOption[] = [
  {
    type: 'bar',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: '📊',
    category: 'basic'
  },
  {
    type: 'line',
    name: 'Line Chart', 
    description: 'Show trends over time',
    icon: '📈',
    category: 'basic'
  },
  {
    type: 'pie',
    name: 'Pie Chart',
    description: 'Show parts of a whole',
    icon: '🥧',
    category: 'basic'
  },
  {
    type: 'donut',
    name: 'Donut Chart',
    description: 'Pie chart with center space',
    icon: '🍩',
    category: 'basic'
  },
  {
    type: 'area',
    name: 'Area Chart',
    description: 'Line chart with filled areas',
    icon: '🏔️',
    category: 'basic'
  },
  {
    type: 'radar',
    name: 'Radar Chart',
    description: 'Compare multiple variables',
    icon: '🎯',
    category: 'advanced'
  },
  {
    type: 'polar',
    name: 'Polar Area Chart',
    description: 'Circular area chart',
    icon: '🌟',
    category: 'advanced'
  },
  {
    type: 'scatter',
    name: 'Scatter Plot',
    description: 'Show correlation between variables',
    icon: '⚡',
    category: 'advanced'
  },
  {
    type: 'bubble',
    name: 'Bubble Chart',
    description: 'Three-dimensional data visualization',
    icon: '🫧',
    category: 'advanced'
  }
];

/* ===================== Main Component ===================== */
export default function ChartSelectModal({ 
  isOpen, 
  onClose, 
  onSelectChart 
}: ChartSelectModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const basicCharts = CHART_OPTIONS.filter(chart => chart.category === 'basic');
  const advancedCharts = CHART_OPTIONS.filter(chart => chart.category === 'advanced');

  const handleChartSelect = (type: ChartType) => {
    onSelectChart(type);
    // onClose() sẽ được gọi từ openConfigModal trong hook
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const ChartCard = ({ chart }: { chart: ChartOption }) => (
    <button
      onClick={() => handleChartSelect(chart.type)}
      className="p-4 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg text-left w-full"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border.default;
        e.currentTarget.style.backgroundColor = theme.background.primary;
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{chart.icon}</div>
        <div className="flex-1">
          <h3 
            className="font-medium text-sm mb-1"
            style={{ color: theme.text.primary }}
          >
            {chart.name}
          </h3>
          <p 
            className="text-xs"
            style={{ color: theme.text.secondary }}
          >
            {chart.description}
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      height="80vh"
      className="max-h-[80vh] overflow-y-auto"
      style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default,
      }}
      showHeader={false}
    >
      {/* Custom Header */}
      <div 
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <div>
          <h2 
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            Add Chart
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: theme.text.secondary }}
          >
            Choose a chart type to add to your dashboard
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: theme.background.primary,
            color: theme.text.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.hover || theme.background.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.primary;
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Basic Charts */}
        <div className="mb-8">
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: theme.text.primary }}
          >
            Basic Charts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicCharts.map((chart) => (
              <ChartCard key={chart.type} chart={chart} />
            ))}
          </div>
        </div>

        {/* Advanced Charts */}
        <div>
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: theme.text.primary }}
          >
            Advanced Charts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedCharts.map((chart) => (
              <ChartCard key={chart.type} chart={chart} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="flex justify-end p-6 border-t"
        style={{ borderColor: theme.border.default }}
      >
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: theme.background.primary,
            color: theme.text.secondary,
            borderColor: theme.border.default,
          }}
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  );
}

/* ===================== Export Types ===================== */
export type { ChartType };