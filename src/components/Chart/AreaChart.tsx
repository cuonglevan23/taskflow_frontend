"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/layouts/hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ===================== Types ===================== */
export interface AreaChartDataset {
  label: string;
  data: number[];
  color?: string;
  fillOpacity?: number;
  tension?: number;
}

interface AreaChartProps {
  labels: string[];
  datasets: AreaChartDataset[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  smooth?: boolean;
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
export default function AreaChart({
  labels,
  datasets,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  stacked = false,
  smooth = true,
  className = "",
  style,
}: AreaChartProps) {
  const { theme } = useTheme();

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const color = dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      const fillOpacity = dataset.fillOpacity || 0.2;
      
      return {
        label: dataset.label,
        data: dataset.data,
        borderColor: color,
        backgroundColor: hexToRgba(color, fillOpacity),
        fill: true,
        tension: dataset.tension !== undefined ? dataset.tension : (smooth ? 0.4 : 0),
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: "#fff",
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        pointBorderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: stacked,
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
      },
      y: {
        stacked: stacked,
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
        mode: 'index' as const,
        intersect: false,
      },
      filler: {
        propagate: false,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 8,
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
      <Line data={chartData} options={options} />
    </div>
  );
}

/* ===================== Export Types ===================== */
export type { AreaChartDataset };