"use client";

import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import { useTheme } from "@/layouts/hooks/useTheme";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

/* ===================== Types ===================== */
export interface BubblePoint {
  x: number;
  y: number;
  r: number; // radius
  label?: string;
}

export interface BubbleChartDataset {
  label: string;
  data: BubblePoint[];
  color?: string;
}

interface BubbleChartProps {
  datasets: BubbleChartDataset[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  maxBubbleSize?: number;
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

/* ===================== Helper Functions ===================== */
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ===================== Main Component ===================== */
export default function BubbleChart({
  datasets,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  maxBubbleSize = 20,
  className = "",
  style,
}: BubbleChartProps) {
  const { theme } = useTheme();

  const chartData = {
    datasets: datasets.map((dataset, index) => {
      const color = dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      
      return {
        label: dataset.label,
        data: dataset.data,
        backgroundColor: hexToRgba(color, 0.6),
        borderColor: color,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBackgroundColor: hexToRgba(color, 0.8),
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
            return `${label}: (${point.x}, ${point.y}) Size: ${point.r}`;
          },
        },
      },
    },
    elements: {
      point: {
        radius: function(context: any) {
          const value = context.parsed.r;
          const size = Math.sqrt(value) * 2;
          return Math.min(size, maxBubbleSize);
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
      <Bubble data={chartData} options={options} />
    </div>
  );
}

/* ===================== Export Types ===================== */
export type { BubblePoint, BubbleChartDataset };