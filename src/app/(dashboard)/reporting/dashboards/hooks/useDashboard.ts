"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "../components";
import { Chart } from "./useChartModal";

/* ===================== Types ===================== */
interface UseDashboardReturn {
  dashboard: Dashboard | null;
  charts: Chart[];
  isLoading: boolean;
  error: string | null;
  updateDashboard: (updates: Partial<Dashboard>) => Promise<void>;
  addChart: (chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeChart: (chartId: string) => Promise<void>;
  updateChart: (chartId: string, updates: Partial<Chart>) => Promise<void>;
}

/* ===================== Mock Data ===================== */
const MOCK_DASHBOARDS: Record<string, Dashboard> = {
  '1': {
    id: '1',
    name: 'Sales Analytics Dashboard',
    description: 'Track sales performance and key metrics',
    color: '#3b82f6',
    owner: {
      id: 'user-1',
      name: 'Văn Lê',
      initials: 'VL'
    },
    isRecent: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  '2': {
    id: '2',
    name: 'Marketing Performance',
    description: 'Monitor marketing campaigns and ROI',
    color: '#10b981',
    owner: {
      id: 'user-1',
      name: 'Văn Lê',
      initials: 'VL'
    },
    isRecent: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  '3': {
    id: '3',
    name: 'Product Analytics',
    description: 'User behavior and product usage insights',
    color: '#8b5cf6',
    owner: {
      id: 'user-1',
      name: 'Văn Lê',
      initials: 'VL'
    },
    isRecent: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  }
};

export const MOCK_DASHBOARD_CHARTS: Record<string, Chart[]> = {
  '1': [
    {
      id: 'chart-1',
      type: 'bar',
      title: 'Monthly Sales',
      data: [
        { label: 'Jan', value: 65000 },
        { label: 'Feb', value: 59000 },
        { label: 'Mar', value: 80000 },
        { label: 'Apr', value: 81000 },
        { label: 'May', value: 56000 },
        { label: 'Jun', value: 75000 }
      ],
      showLegend: true,
      height: 400,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'chart-2',
      type: 'pie',
      title: 'Sales by Region',
      data: [
        { label: 'North', value: 35 },
        { label: 'South', value: 25 },
        { label: 'East', value: 20 },
        { label: 'West', value: 20 }
      ],
      showLegend: true,
      height: 400,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    }
  ],
  '2': [
    {
      id: 'chart-3',
      type: 'line',
      title: 'Campaign Performance',
      data: [
        { label: 'Week 1', value: 1200 },
        { label: 'Week 2', value: 1900 },
        { label: 'Week 3', value: 3000 },
        { label: 'Week 4', value: 5000 }
      ],
      showLegend: true,
      height: 400,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
    }
  ],
  '3': []
};

/* ===================== Hook ===================== */
export function useDashboard(dashboardId: string): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call to fetch dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to get from localStorage first (for newly created dashboards)
        let dashboardData = MOCK_DASHBOARDS[dashboardId];
        let chartsData = MOCK_DASHBOARD_CHARTS[dashboardId] || [];

        if (!dashboardData) {
          // Check localStorage for newly created dashboard
          const storedDashboard = localStorage.getItem(`dashboard_${dashboardId}`);
          const storedCharts = localStorage.getItem(`dashboard_charts_${dashboardId}`);
          
          if (storedDashboard) {
            dashboardData = JSON.parse(storedDashboard);
            // Convert date strings back to Date objects
            dashboardData.createdAt = new Date(dashboardData.createdAt);
            dashboardData.updatedAt = new Date(dashboardData.updatedAt);
          }
          
          if (storedCharts) {
            chartsData = JSON.parse(storedCharts);
            // Convert date strings back to Date objects
            chartsData = chartsData.map(chart => ({
              ...chart,
              createdAt: new Date(chart.createdAt),
              updatedAt: new Date(chart.updatedAt)
            }));
          }
        }

        if (!dashboardData) {
          throw new Error(`Dashboard with ID "${dashboardId}" not found`);
        }

        setDashboard(dashboardData);
        setCharts(chartsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (dashboardId) {
      fetchDashboard();
    }
  }, [dashboardId]);

  // Update dashboard
  const updateDashboard = async (updates: Partial<Dashboard>) => {
    if (!dashboard) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedDashboard = {
        ...dashboard,
        ...updates,
        updatedAt: new Date(),
      };

      setDashboard(updatedDashboard);
      
      // Update mock data
      MOCK_DASHBOARDS[dashboardId] = updatedDashboard;
      
      console.log('✅ Dashboard updated successfully:', updatedDashboard);
      
      console.log('Dashboard updated:', updatedDashboard);
    } catch (err) {
      console.error('Failed to update dashboard:', err);
    }
  };

  // Add chart to dashboard
  const addChart = async (chartData: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const newChart: Chart = {
        ...chartData,
        id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCharts(prev => [...prev, newChart]);
      
      // Update mock data
      MOCK_DASHBOARD_CHARTS[dashboardId] = [...(MOCK_DASHBOARD_CHARTS[dashboardId] || []), newChart];
      
      console.log('✅ Chart added to dashboard:', newChart);
      console.log('📊 Dashboard now has', MOCK_DASHBOARD_CHARTS[dashboardId].length, 'charts');
    } catch (err) {
      console.error('Failed to add chart:', err);
    }
  };

  // Remove chart from dashboard
  const removeChart = async (chartId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      setCharts(prev => prev.filter(chart => chart.id !== chartId));
      
      // Update mock data
      MOCK_DASHBOARD_CHARTS[dashboardId] = (MOCK_DASHBOARD_CHARTS[dashboardId] || [])
        .filter(chart => chart.id !== chartId);
      
      console.log('Chart removed from dashboard:', chartId);
    } catch (err) {
      console.error('Failed to remove chart:', err);
    }
  };

  // Update chart in dashboard
  const updateChart = async (chartId: string, updates: Partial<Chart>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setCharts(prev => prev.map(chart => 
        chart.id === chartId 
          ? { ...chart, ...updates, updatedAt: new Date() }
          : chart
      ));
      
      // Update mock data
      MOCK_DASHBOARD_CHARTS[dashboardId] = (MOCK_DASHBOARD_CHARTS[dashboardId] || [])
        .map(chart => 
          chart.id === chartId 
            ? { ...chart, ...updates, updatedAt: new Date() }
            : chart
        );
      
      console.log('Chart updated in dashboard:', chartId, updates);
    } catch (err) {
      console.error('Failed to update chart:', err);
    }
  };

  return {
    dashboard,
    charts,
    isLoading,
    error,
    updateDashboard,
    addChart,
    removeChart,
    updateChart,
  };
}

/* ===================== Export ===================== */
export { MOCK_DASHBOARDS };