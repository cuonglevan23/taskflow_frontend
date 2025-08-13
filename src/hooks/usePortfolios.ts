"use client";

import { useState, useMemo, useCallback } from "react";
import { IconType } from "react-icons";

// Portfolio Types and Interfaces
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: IconType;
  status: 'active' | 'archived' | 'draft';
  starred: boolean;
  featured?: boolean;
  category: 'personal' | 'business' | 'educational' | 'creative';
  projectsCount: number;
  tasksCount: number;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  collaborators?: string[];
  tags?: string[];
}

export type PortfolioColorKey = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'teal' | 'indigo';

export const PORTFOLIO_COLORS: Record<PortfolioColorKey, string> = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1',
};

// Hook Configuration Interface
interface UsePortfoliosConfig {
  initialLimit?: number;
  filterByStatus?: Portfolio['status'][];
  filterByCategory?: Portfolio['category'][];
  filterStarred?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'progress' | 'projectsCount';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // For multi-user support
}

// Mock Data Generator
const generateMockPortfolios = (userId?: string): Portfolio[] => {
  const basePortfolios = [
    {
      id: 'port-1',
      name: 'Personal Projects',
      description: 'My personal development and learning projects',
      color: PORTFOLIO_COLORS.purple,
      status: 'active' as const,
      starred: true,
      featured: true,
      category: 'personal' as const,
      projectsCount: 5,
      tasksCount: 23,
      progress: 67,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      ownerId: userId || 'user-1',
      tags: ['development', 'learning'],
    },
    {
      id: 'port-2',
      name: 'Client Work',
      description: 'All client projects and deliverables',
      color: PORTFOLIO_COLORS.blue,
      status: 'active' as const,
      starred: false,
      category: 'business' as const,
      projectsCount: 3,
      tasksCount: 12,
      progress: 89,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      ownerId: userId || 'user-1',
      tags: ['client', 'business'],
    },
    {
      id: 'port-3',
      name: 'Learning & Courses',
      description: 'Educational projects and course work',
      color: PORTFOLIO_COLORS.green,
      status: 'active' as const,
      starred: true,
      category: 'educational' as const,
      projectsCount: 7,
      tasksCount: 34,
      progress: 45,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-19'),
      ownerId: userId || 'user-1',
      tags: ['education', 'courses'],
    },
    {
      id: 'port-4',
      name: 'Creative Projects',
      description: 'Art, design, and creative endeavors',
      color: PORTFOLIO_COLORS.pink,
      status: 'active' as const,
      starred: false,
      category: 'creative' as const,
      projectsCount: 4,
      tasksCount: 18,
      progress: 23,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-16'),
      ownerId: userId || 'user-1',
      tags: ['creative', 'design'],
    },
    {
      id: 'port-5',
      name: 'Archived Work',
      description: 'Completed and archived projects',
      color: PORTFOLIO_COLORS.teal,
      status: 'archived' as const,
      starred: false,
      category: 'business' as const,
      projectsCount: 8,
      tasksCount: 45,
      progress: 100,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-01'),
      ownerId: userId || 'user-1',
      tags: ['archived', 'completed'],
    },
  ];

  return basePortfolios;
};

// Professional Portfolios Hook
export const usePortfolios = (config: UsePortfoliosConfig = {}) => {
  const {
    initialLimit = 4,
    filterByStatus = ['active'],
    filterByCategory,
    filterStarred,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    userId
  } = config;

  // Mock data - In real app, this would come from context or API
  const [allPortfolios] = useState<Portfolio[]>(() => generateMockPortfolios(userId));
  const [_isLoading] = useState(false);
  const [showAllPortfolios, setShowAllPortfolios] = useState(false);

  // Computed Values with Filtering and Sorting
  const filteredPortfolios = useMemo(() => {
    return allPortfolios
      .filter(portfolio => {
        // Filter by status
        if (!filterByStatus.includes(portfolio.status)) return false;
        
        // Filter by category
        if (filterByCategory && !filterByCategory.includes(portfolio.category)) return false;
        
        // Filter by starred
        if (filterStarred !== undefined && portfolio.starred !== filterStarred) return false;
        
        // Filter by user (multi-user support)
        if (userId && portfolio.ownerId !== userId) return false;
        
        return true;
      })
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }
        
        if (sortBy === 'progress' || sortBy === 'projectsCount') {
          const aVal = (aValue as number) || 0;
          const bVal = (bValue as number) || 0;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Date sorting
        const aDate = new Date(aValue as Date).getTime();
        const bDate = new Date(bValue as Date).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });
  }, [allPortfolios, filterByStatus, filterByCategory, filterStarred, sortBy, sortOrder, userId]);

  const featuredPortfolio = useMemo(() => {
    return filteredPortfolios.find(p => p.featured);
  }, [filteredPortfolios]);

  const starredPortfolios = useMemo(() => {
    return filteredPortfolios.filter(p => p.starred);
  }, [filteredPortfolios]);

  const recentPortfolios = useMemo(() => {
    return filteredPortfolios
      .filter(p => !p.starred)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [filteredPortfolios]);

  const displayedPortfolios = useMemo(() => {
    return showAllPortfolios ? filteredPortfolios : filteredPortfolios.slice(0, initialLimit);
  }, [filteredPortfolios, showAllPortfolios, initialLimit]);

  const hasMorePortfolios = useMemo(() => {
    return filteredPortfolios.length > initialLimit;
  }, [filteredPortfolios.length, initialLimit]);

  // Portfolio Statistics
  const portfolioStats = useMemo(() => {
    const stats = {
      total: allPortfolios.length,
      active: allPortfolios.filter(p => p.status === 'active').length,
      starred: allPortfolios.filter(p => p.starred).length,
      archived: allPortfolios.filter(p => p.status === 'archived').length,
      totalProjects: allPortfolios.reduce((sum, p) => sum + p.projectsCount, 0),
      totalTasks: allPortfolios.reduce((sum, p) => sum + p.tasksCount, 0),
      averageProgress: Math.round(
        allPortfolios.reduce((sum, p) => sum + p.progress, 0) / allPortfolios.length
      ),
    };
    return stats;
  }, [allPortfolios]);

  // Actions
  const toggleShowAll = useCallback(() => {
    setShowAllPortfolios(prev => !prev);
  }, []);

  const addPortfolio = useCallback((portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
    // In real app, this would call API
    console.log('Adding portfolio:', portfolio);
  }, []);

  const updatePortfolio = useCallback((id: string, updates: Partial<Portfolio>) => {
    // In real app, this would call API
    console.log('Updating portfolio:', id, updates);
  }, []);

  const deletePortfolio = useCallback((id: string) => {
    // In real app, this would call API
    console.log('Deleting portfolio:', id);
  }, []);

  const toggleStar = useCallback((id: string) => {
    // In real app, this would call API
    console.log('Toggling star for portfolio:', id);
  }, []);

  const setFeaturedPortfolio = useCallback((id: string) => {
    // In real app, this would call API
    console.log('Setting featured portfolio:', id);
  }, []);

  return {
    // Data
    portfolios: filteredPortfolios,
    featuredPortfolio,
    starredPortfolios,
    recentPortfolios,
    displayedPortfolios,
    
    // State
    showAllPortfolios,
    isLoading,
    hasMorePortfolios,
    
    // Actions
    toggleShowAll,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    toggleStar,
    setFeaturedPortfolio,
    
    // Computed
    portfolioStats,
  };
};

// Hook Return Type
export interface UsePortfoliosReturn {
  // Data
  portfolios: Portfolio[];
  featuredPortfolio: Portfolio | undefined;
  starredPortfolios: Portfolio[];
  recentPortfolios: Portfolio[];
  displayedPortfolios: Portfolio[];
  
  // State
  showAllPortfolios: boolean;
  isLoading: boolean;
  hasMorePortfolios: boolean;
  
  // Actions
  toggleShowAll: () => void;
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  toggleStar: (id: string) => void;
  setFeaturedPortfolio: (id: string) => void;
  
  // Computed
  portfolioStats: {
    total: number;
    active: number;
    starred: number;
    archived: number;
    totalProjects: number;
    totalTasks: number;
    averageProgress: number;
  };
}