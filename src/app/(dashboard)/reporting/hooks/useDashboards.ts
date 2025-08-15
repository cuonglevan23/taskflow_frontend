"use client";

import { useState, useMemo, useCallback } from "react";
import { type Dashboard } from "../components/DashboardCard";
import { MOCK_DASHBOARDS } from "../dashboards/hooks/useDashboard";

// Hook Configuration Interface
interface UseDashboardsConfig {
  userId?: string;
  filterRecent?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Mock data generator - Use shared mock dashboards
const generateMockDashboards = (userId?: string): Dashboard[] => {
  return Object.values(MOCK_DASHBOARDS);
};

// Professional Dashboards Hook - Reusable across app
export const useDashboards = (config: UseDashboardsConfig = {}) => {
  const {
    userId,
    filterRecent = false,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = config;

  // State Management
  const [dashboards, setDashboards] = useState<Dashboard[]>(() => 
    generateMockDashboards(userId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed Values - Filtered and Sorted
  const filteredDashboards = useMemo(() => {
    let filtered = [...dashboards];
    
    // Filter by recent if requested
    if (filterRecent) {
      filtered = filtered.filter(dashboard => dashboard.isRecent);
    }
    
    // Filter by user if provided
    if (userId) {
      filtered = filtered.filter(dashboard => dashboard.owner.id === userId);
    }
    
    // Sort dashboards
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'name') {
        const result = (aValue as string).localeCompare(bValue as string);
        return sortOrder === 'asc' ? result : -result;
      }
      
      // Date sorting
      const aTime = new Date(aValue as Date).getTime();
      const bTime = new Date(bValue as Date).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
    
    return filtered;
  }, [dashboards, filterRecent, userId, sortBy, sortOrder]);

  // Recent dashboards (convenience getter)
  const recentDashboards = useMemo(() => {
    return dashboards.filter(dashboard => dashboard.isRecent);
  }, [dashboards]);

  // Dashboard Statistics
  const dashboardStats = useMemo(() => ({
    total: dashboards.length,
    recent: recentDashboards.length,
    owned: dashboards.filter(d => d.owner.id === userId).length,
  }), [dashboards, recentDashboards.length, userId]);

  // Actions - Type-safe and reusable
  const createDashboard = useCallback(async (
    dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In real app, this would call API
      const newDashboard: Dashboard = {
        ...dashboardData,
        id: `dashboard-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setDashboards(prev => [newDashboard, ...prev]);
      
      return newDashboard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDashboard = useCallback(async (
    id: string, 
    updates: Partial<Dashboard>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setDashboards(prev => prev.map(dashboard => 
        dashboard.id === id 
          ? { ...dashboard, ...updates, updatedAt: new Date() }
          : dashboard
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDashboard = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setDashboards(prev => prev.filter(dashboard => dashboard.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    dashboards: filteredDashboards,
    recentDashboards,
    allDashboards: dashboards,
    
    // State
    isLoading,
    error,
    
    // Actions
    createDashboard,
    updateDashboard,
    deleteDashboard,
    
    // Stats
    stats: dashboardStats,
  };
};

// Hook Return Type for better TypeScript support
export interface UseDashboardsReturn {
  dashboards: Dashboard[];
  recentDashboards: Dashboard[];
  allDashboards: Dashboard[];
  isLoading: boolean;
  error: string | null;
  createDashboard: (data: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Dashboard>;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  stats: {
    total: number;
    recent: number;
    owned: number;
  };
}