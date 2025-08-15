"use client";

import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { useTheme } from "@/layouts/hooks/useTheme";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

/* ===================== Types ===================== */
export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ScatterChartDataset {
  label: string;
  data: ScatterPoint[];
  color?: string;
  pointRadius?: number;
  showLine?: boolean;
}

interface ScatterChartProps {
  datasets: ScatterChartDataset[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* ===================== Default Colors ===================== */
const DEFAULT_COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
];

/* ===================== Main Component ===================== */
export default function ScatterChart({
  datasets,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  className = "",
  style,
}: ScatterChartProps) {
  const { theme } = useTheme();

  const chartData = {
    datasets: datasets.map((dataset, index) => {
      const color = dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      
      return {
        label: dataset.label,
        data: dataset.data,
        backgroundColor: color,
        borderColor: color,
        pointRadius: dataset.pointRadius || 5,
        pointHoverRadius: 8,
        showLine: dataset.showLine || false,
        borderWidth: dataset.showLine ? 2 : 0,
        tension: 0.1,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        grid: {
          display: showGrid,
          color: theme.border.default,
        },
        ticks: {
          color: theme.text.secondary,
          font: {
            family: 'Inter, sans-serif',
          },
        },
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          color: theme.text.primary,
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: '500',
          },
        },
      },
      y: {
        grid: {
          display: showGrid,
          color: theme.border.default,
        },
        ticks: {
          color: theme.text.secondary,
          font: {
            family: 'Inter, sans-serif',
          },
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: theme.text.primary,
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: '500',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: theme.text.primary,
          font: {
            family: 'Inter, sans-serif',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: !!title,
        text: title,
        color: theme.text.primary,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600',
        },
      },
      tooltip: {
        backgroundColor: theme.background.secondary,
        titleColor: theme.text.primary,
        bodyColor: theme.text.secondary,
        borderColor: theme.border.default,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const point = context.parsed;
            const label = context.dataset.label || '';
            return `${label}: (${point.x}, ${point.y})`;
          },
        },
      },
    },
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${className}`}
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        height: height,
        ...style,
      }}
    >
      <Scatter data={chartData} options={options} />
    </div>
  );
}

/* ===================== Export Types ===================== */
export type { ScatterPoint, ScatterChartDataset };