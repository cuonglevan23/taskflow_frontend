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
  const addChart = (config: ChartConfig & { type: ChartType }) => {
    const newChart: Chart = {
      ...config,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCharts(prev => [...prev, newChart]);
    setIsConfigModalOpen(false);
    setSelectedChartType(null);
    
    console.log('Chart added:', newChart);
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