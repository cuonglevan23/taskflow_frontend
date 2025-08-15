"use client";

import { useState } from "react";
import { ChartType, ChartConfig } from "../components";

/* ===================== Types ===================== */
export interface Chart extends ChartConfig {
  id: string;
  type: ChartType;
  createdAt: Date;
  updatedAt: Date;
}

interface UseChartModalReturn {
  // Modal states
  isSelectModalOpen: boolean;
  isConfigModalOpen: boolean;
  selectedChartType: ChartType | null;
  
  // Charts data
  charts: Chart[];
  
  // Modal actions
  openSelectModal: () => void;
  closeSelectModal: () => void;
  openConfigModal: (type: ChartType) => void;
  closeConfigModal: () => void;
  
  // Chart actions
  addChart: (config: ChartConfig & { type: ChartType }) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, config: Partial<ChartConfig>) => void;
}

/* ===================== Hook ===================== */
export function useChartModal(): UseChartModalReturn {
  // Modal states
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<ChartType | null>(null);
  
  // Charts data
  const [charts, setCharts] = useState<Chart[]>([]);

  // Modal actions
  const openSelectModal = () => {
    setIsSelectModalOpen(true);
  };

  const closeSelectModal = () => {
    setIsSelectModalOpen(false);
    setSelectedChartType(null);
  };

  const openConfigModal = (type: ChartType) => {
    setSelectedChartType(type);
    setIsSelectModalOpen(false);
    setIsConfigModalOpen(true);
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
    setSelectedChartType(null);
  };

  // Chart actions
  const addChart = async (config: ChartConfig & { type: ChartType }) => {
    try {
      // Create new dashboard with the chart
      const newDashboard = {
        name: config.title || "New Dashboard",
        color: "#8b5cf6",
        owner: { id: "user-1", name: "Văn Lê", initials: "VL" },
        isRecent: true,
      };

      // Generate dashboard ID
      const dashboardId = Date.now().toString();
      
      // Create chart
      const newChart: Chart = {
        ...config,
        id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in localStorage to persist across navigation
      const dashboardData = {
        ...newDashboard,
        id: dashboardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store dashboard and chart in localStorage
      localStorage.setItem(`dashboard_${dashboardId}`, JSON.stringify(dashboardData));
      localStorage.setItem(`dashboard_charts_${dashboardId}`, JSON.stringify([newChart]));

      setIsConfigModalOpen(false);
      setSelectedChartType(null);
      
      console.log('✅ Dashboard created with chart:', { dashboardId, chart: newChart });
      
      // Navigate to new dashboard
      window.location.href = `/reporting/dashboards/${dashboardId}`;
      
    } catch (error) {
      console.error('❌ Failed to create dashboard with chart:', error);
    }
  };

  const removeChart = (id: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== id));
    console.log('Chart removed:', id);
  };

  const updateChart = (id: string, config: Partial<ChartConfig>) => {
    setCharts(prev => prev.map(chart => 
      chart.id === id 
        ? { ...chart, ...config, updatedAt: new Date() }
        : chart
    ));
    console.log('Chart updated:', id, config);
  };

  return {
    // Modal states
    isSelectModalOpen,
    isConfigModalOpen,
    selectedChartType,
    
    // Charts data
    charts,
    
    // Modal actions
    openSelectModal,
    closeSelectModal,
    openConfigModal,
    closeConfigModal,
    
    // Chart actions
    addChart,
    removeChart,
    updateChart,
  };
}

/* ===================== Export Types ===================== */
export type { Chart };