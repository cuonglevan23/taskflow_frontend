"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTheme } from "@/layouts/hooks/useTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ===================== Types ===================== */
export interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  cutout?: number; // For donut chart (0-90)
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
  "#f97316", // Orange
  "#6366f1", // Indigo
];

/* ===================== Main Component ===================== */
export default function PieChart({
  data,
  title,
  height = 400,
  showLegend = true,
  showPercentage = true,
  cutout = 0,
  className = "",
  style,
}: PieChartProps) {
  const { theme } = useTheme();

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => 
          item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        ),
        borderColor: data.map((item, index) => 
          item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        ),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: cutout > 0 ? `${cutout}%` : undefined,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          color: theme.text.primary,
          font: {
            family: 'Inter, sans-serif',
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return {
                  text: showPercentage ? `${label} (${percentage}%)` : label,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
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
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
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
      <Pie data={chartData} options={options} />
    </div>
  );
}

/* ===================== Export Types ===================== */
export type { PieChartData };