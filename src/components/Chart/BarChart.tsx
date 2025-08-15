"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/layouts/hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* ===================== Types ===================== */
export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  borderRadius?: number;
  showLegend?: boolean;
  horizontal?: boolean;
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
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

/* ===================== Main Component ===================== */
export default function BarChart({
  data,
  title,
  height = 400,
  borderRadius = 8,
  showLegend = true,
  horizontal = false,
  className = "",
  style,
}: BarChartProps) {
  const { theme } = useTheme();

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title || "Data",
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => 
          item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        ),
        borderColor: data.map((item, index) => 
          item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        ),
        borderWidth: 1,
        borderRadius: borderRadius,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: theme.text.primary,
          font: {
            family: 'Inter, sans-serif',
          },
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
      },
    },
    scales: {
      x: {
        grid: {
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
      <Bar data={chartData} options={options} />
    </div>
  );
}

/* ===================== Export Types ===================== */
export type { BarChartData };