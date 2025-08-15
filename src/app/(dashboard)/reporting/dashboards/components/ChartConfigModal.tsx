"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { BaseModal } from "@/components/ui";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  DonutChart, 
  AreaChart, 
  RadarChart, 
  PolarAreaChart,
  ScatterChart,
  BubbleChart,
  type BarChartData,
  type PieChartData,
  type LineChartDataset,
  type DonutChartData,
  type AreaChartDataset,
  type RadarChartDataset,
  type PolarAreaChartData,
  type ScatterChartDataset,
  type BubbleChartDataset
} from "@/components/Chart";
import { ChartType } from "./ChartSelectModal";

/* ===================== Types ===================== */
interface ChartConfig {
  title: string;
  data: any; // Will be typed based on chart type
  showLegend: boolean;
  height: number;
}

interface ChartConfigModalProps {
  isOpen: boolean;
  chartType: ChartType | null;
  onClose: () => void;
  onSave: (config: ChartConfig & { type: ChartType }) => void;
}

/* ===================== Sample Data ===================== */
const getSampleData = (type: ChartType) => {
  switch (type) {
    case 'bar':
    case 'line':
    case 'area':
      return [
        { label: 'Jan', value: 65 },
        { label: 'Feb', value: 59 },
        { label: 'Mar', value: 80 },
        { label: 'Apr', value: 81 },
        { label: 'May', value: 56 },
        { label: 'Jun', value: 55 }
      ];
    
    case 'pie':
    case 'donut':
    case 'polar':
      return [
        { label: 'Red', value: 12 },
        { label: 'Blue', value: 19 },
        { label: 'Yellow', value: 3 },
        { label: 'Green', value: 5 },
        { label: 'Purple', value: 2 }
      ];
    
    case 'radar':
      return [
        { label: 'Eating', value: 2 },
        { label: 'Drinking', value: 3 },
        { label: 'Sleeping', value: 4 },
        { label: 'Designing', value: 3 },
        { label: 'Coding', value: 5 },
        { label: 'Cycling', value: 2 }
      ];
    
    case 'scatter':
      return [
        { x: 10, y: 20 },
        { x: 15, y: 25 },
        { x: 20, y: 30 },
        { x: 25, y: 35 },
        { x: 30, y: 40 }
      ];
    
    case 'bubble':
      return [
        { x: 20, y: 30, r: 15 },
        { x: 40, y: 10, r: 10 },
        { x: 60, y: 40, r: 25 },
        { x: 80, y: 20, r: 20 }
      ];
    
    default:
      return [];
  }
};

/* ===================== Main Component ===================== */
export default function ChartConfigModal({
  isOpen,
  chartType,
  onClose,
  onSave
}: ChartConfigModalProps) {
  const { theme } = useTheme();
  const [config, setConfig] = useState<ChartConfig>({
    title: '',
    data: [],
    showLegend: true,
    height: 400
  });

  // Initialize with sample data when chart type changes
  useEffect(() => {
    if (chartType) {
      setConfig({
        title: `New ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        data: getSampleData(chartType),
        showLegend: true,
        height: 400
      });
    }
  }, [chartType]);

  if (!isOpen || !chartType) return null;

  const handleSave = () => {
    onSave({
      ...config,
      type: chartType
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderDataEditor = () => {
    const isScatterOrBubble = chartType === 'scatter' || chartType === 'bubble';
    
    if (isScatterOrBubble) {
      return (
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            Data Points (JSON format)
          </label>
          <textarea
            value={JSON.stringify(config.data, null, 2)}
            onChange={(e) => {
              try {
                const newData = JSON.parse(e.target.value);
                setConfig(prev => ({ ...prev, data: newData }));
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
            className="w-full p-3 rounded-lg border text-sm font-mono"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            }}
            rows={6}
            placeholder='[{"x": 10, "y": 20}, {"x": 15, "y": 25}]'
          />
        </div>
      );
    }

    return (
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme.text.primary }}
        >
          Data Points
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {config.data.map((item: any, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const newData = [...config.data];
                  newData[index] = { ...newData[index], label: e.target.value };
                  setConfig(prev => ({ ...prev, data: newData }));
                }}
                className="flex-1 p-2 rounded border text-sm"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                }}
                placeholder="Label"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => {
                  const newData = [...config.data];
                  newData[index] = { ...newData[index], value: parseFloat(e.target.value) || 0 };
                  setConfig(prev => ({ ...prev, data: newData }));
                }}
                className="w-20 p-2 rounded border text-sm"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                }}
                placeholder="Value"
              />
              <button
                onClick={() => {
                  const newData = config.data.filter((_: any, i: number) => i !== index);
                  setConfig(prev => ({ ...prev, data: newData }));
                }}
                className="p-2 rounded text-red-500 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newData = [...config.data, { label: '', value: 0 }];
            setConfig(prev => ({ ...prev, data: newData }));
          }}
          className="mt-2 px-3 py-1 rounded text-sm transition-colors"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            color: theme.text.primary,
          }}
        >
          + Add Data Point
        </button>
      </div>
    );
  };

  const renderPreview = () => {
    const commonProps = {
      data: config.data,
      title: config.title,
      height: 300,
      showLegend: config.showLegend,
    };

    switch (chartType) {
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'line':
        return <LineChart {...commonProps} datasets={[{ label: 'Dataset', data: config.data }]} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      case 'donut':
        return <DonutChart {...commonProps} />;
      case 'area':
        return <AreaChart {...commonProps} datasets={[{ label: 'Dataset', data: config.data }]} />;
      case 'radar':
        return <RadarChart {...commonProps} datasets={[{ label: 'Dataset', data: config.data }]} />;
      case 'polar':
        return <PolarAreaChart {...commonProps} />;
      case 'scatter':
        return <ScatterChart {...commonProps} datasets={[{ label: 'Dataset', data: config.data }]} />;
      case 'bubble':
        return <BubbleChart {...commonProps} datasets={[{ label: 'Dataset', data: config.data }]} />;
      default:
        return <div>Preview not available</div>;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      height="90vh"
      className="max-h-[90vh] overflow-hidden"
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
            Configure {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: theme.text.secondary }}
          >
            Customize your chart settings and preview the result
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: theme.background.primary,
            color: theme.text.secondary,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex h-[calc(90vh-200px)]">
        {/* Configuration Panel */}
        <div 
          className="w-1/3 p-6 border-r overflow-y-auto"
          style={{ borderColor: theme.border.default }}
        >
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text.primary }}
              >
                Chart Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 rounded-lg border"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                }}
                placeholder="Enter chart title"
              />
            </div>

            {/* Show Legend */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLegend"
                checked={config.showLegend}
                onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                className="rounded"
              />
              <label 
                htmlFor="showLegend"
                className="text-sm"
                style={{ color: theme.text.primary }}
              >
                Show Legend
              </label>
            </div>

            {/* Height */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text.primary }}
              >
                Height: {config.height}px
              </label>
              <input
                type="range"
                min="300"
                max="800"
                step="50"
                value={config.height}
                onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Data Editor */}
            {renderDataEditor()}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 p-6 overflow-auto">
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: theme.text.primary }}
          >
            Preview
          </h3>
          <div className="border rounded-lg p-4" style={{ borderColor: theme.border.default }}>
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="flex justify-end space-x-3 p-6 border-t"
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
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
          }}
        >
          Add Chart
        </button>
      </div>
    </BaseModal>
  );
}

/* ===================== Export Types ===================== */
export type { ChartConfig };