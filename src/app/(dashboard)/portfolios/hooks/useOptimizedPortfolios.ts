"use client";

import { useMemo } from "react";
import { usePortfolios, type Portfolio } from "@/hooks";

// Optimized Portfolio Hook Configuration
interface UseOptimizedPortfoliosConfig {
  userId?: string;
  initialLimit?: number;
  showBrowseAll?: boolean;
  defaultTab?: 'recent' | 'starred';
}

// Optimized Hook for Better Performance & Prop Passing
export const useOptimizedPortfolios = (config: UseOptimizedPortfoliosConfig = {}) => {
  const {
    userId,
    initialLimit = 6,
    showBrowseAll = false,
    defaultTab = 'recent'
  } = config;

  // Base portfolio data
  const { 
    portfolioStats, 
    addPortfolio, 
    toggleStar 
  } = usePortfolios({ userId });

  // Recent portfolios hook
  const recentHookData = usePortfolios({
    initialLimit: showBrowseAll ? 20 : initialLimit,
    filterStarred: false,
    sortBy: 'updatedAt',
    userId
  });

  // Starred portfolios hook
  const starredHookData = usePortfolios({
    initialLimit: showBrowseAll ? 20 : initialLimit,
    filterStarred: true,
    sortBy: 'updatedAt', 
    userId
  });

  // Optimized data structure for easy prop passing
  const portfolioData = useMemo(() => ({
    recent: {
      portfolios: recentHookData.portfolios,
      displayed: recentHookData.displayedPortfolios,
      hasMore: recentHookData.hasMorePortfolios,
      toggleShowAll: recentHookData.toggleShowAll,
      showAll: recentHookData.showAllPortfolios,
    },
    starred: {
      portfolios: starredHookData.portfolios,
      displayed: starredHookData.displayedPortfolios,
      hasMore: starredHookData.hasMorePortfolios,
      toggleShowAll: starredHookData.toggleShowAll,
      showAll: starredHookData.showAllPortfolios,
    }
  }), [recentHookData, starredHookData]);

  // Tab configuration - optimized for easy prop passing
  const tabConfigs = useMemo(() => [
    {
      key: 'recent' as const,
      label: 'Recent',
      count: portfolioData.recent.portfolios.length,
      data: portfolioData.recent
    },
    {
      key: 'starred' as const,
      label: 'Starred', 
      count: portfolioData.starred.portfolios.length,
      data: portfolioData.starred
    }
  ], [portfolioData]);

  // Get current tab data
  const getCurrentTabData = (activeTab: 'recent' | 'starred') => {
    return portfolioData[activeTab];
  };

  // Event handlers - optimized for reusability
  const handlers = useMemo(() => ({
    createPortfolio: (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
      addPortfolio(portfolioData);
    },
    toggleStar: (id: string) => {
      toggleStar(id);
    },
    viewPortfolio: (portfolio: Portfolio) => {
      console.log('Viewing portfolio:', portfolio.name);
      // Can be extended with navigation logic
    }
  }), [addPortfolio, toggleStar]);

  return {
    // Data
    portfolioData,
    tabConfigs,
    stats: portfolioStats,
    
    // Functions
    getCurrentTabData,
    handlers,
    
    // Loading state
    isLoading: recentHookData.isLoading || starredHookData.isLoading,
  };
};

// Return type for better TypeScript support
export interface UseOptimizedPortfoliosReturn {
  portfolioData: {
    recent: {
      portfolios: Portfolio[];
      displayed: Portfolio[];
      hasMore: boolean;
      toggleShowAll: () => void;
      showAll: boolean;
    };
    starred: {
      portfolios: Portfolio[];
      displayed: Portfolio[];
      hasMore: boolean;
      toggleShowAll: () => void;
      showAll: boolean;
    };
  };
  tabConfigs: Array<{
    key: 'recent' | 'starred';
    label: string;
    count: number;
    data: any;
  }>;
  stats: any;
  getCurrentTabData: (activeTab: 'recent' | 'starred') => any;
  handlers: {
    createPortfolio: (data: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => void;
    toggleStar: (id: string) => void;
    viewPortfolio: (portfolio: Portfolio) => void;
  };
  isLoading: boolean;
}