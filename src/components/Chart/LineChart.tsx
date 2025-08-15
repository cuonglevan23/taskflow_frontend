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
export interface LineChartDataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
  tension?: number;
}

interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
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

/* ===================== Main Component ===================== */
export default function LineChart({
  labels,
  datasets,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  smooth = true,
  className = "",
  style,
}: LineChartProps) {
  const { theme } = useTheme();

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      backgroundColor: dataset.fill 
        ? `${dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}20`
        : dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      fill: dataset.fill || false,
      tension: dataset.tension !== undefined ? dataset.tension : (smooth ? 0.4 : 0),
      pointBackgroundColor: dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      pointBorderColor: dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      pointHoverBackgroundColor: dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      pointHoverBorderColor: "#fff",
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      },
    },
    scales: {
      x: {
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
    interaction: {
      intersect: false,
      mode: 'index' as const,
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
export type { LineChartDataset };