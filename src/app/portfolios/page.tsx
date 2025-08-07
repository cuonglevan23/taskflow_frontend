"use client";

import React from "react";
import { PageLayout } from "@/layouts/page";
import { 
  PortfoliosCard, 
  PortfolioStatsWidget 
} from "./components";
import { useOptimizedPortfolios } from "./hooks";
import { type Portfolio } from "@/hooks";

// Clean & Optimized Portfolios Page - Using PageLayout with Header Navigation
export default function PortfoliosPage() {
  // Use optimized hook for better performance & prop passing
  const { 
    stats,
    handlers 
  } = useOptimizedPortfolios({
    userId: 'current-user', // In real app, get from auth context
    initialLimit: 6,
    showBrowseAll: false,
    defaultTab: 'recent'
  });

  // Event Handlers - Clean & Reusable
  const handlePortfolioView = (portfolio: Portfolio) => {
    console.log('Navigating to portfolio:', portfolio.name);
    // In real app: router.push(`/portfolios/${portfolio.id}`)
    handlers.viewPortfolio(portfolio);
  };

  const handlePortfolioCreate = (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Portfolio created:', portfolioData.name);
    handlers.createPortfolio(portfolioData);
  };

  // Listen to header actions from PageLayout navigation
  React.useEffect(() => {
    const handleBrowseAll = () => {
      console.log('Browse all clicked from header');
      // Toggle browse all mode
      // This could dispatch to a global state or trigger component state
    };

    const handleCreate = () => {
      console.log('Create portfolio clicked from header');
      // Trigger create action
      handlers.createPortfolio({
        name: "New Portfolio",
        color: "#8b5cf6", // Purple
        status: 'active',
        starred: false,
        category: 'personal',
        projectsCount: 0,
        tasksCount: 0,
        progress: 0,
        description: "A new portfolio created from header",
      });
    };

    window.addEventListener('portfolios-browse-all', handleBrowseAll);
    window.addEventListener('portfolios-create', handleCreate);

    return () => {
      window.removeEventListener('portfolios-browse-all', handleBrowseAll);
      window.removeEventListener('portfolios-create', handleCreate);
    };
  }, [handlers]);

  return (
    <PageLayout>
      <div className="px-8 py-6 space-y-6">
        {/* Stats Widget Component */}
        <PortfolioStatsWidget 
          stats={stats}
          showDetailed={false}
        />

        {/* Main Portfolios Card Component */}
        <div className="max-w-7xl mx-auto">
          <PortfoliosCard
            initialTab="recent"
            viewMode="grid"
            showBrowseAll={false}
            onPortfolioView={handlePortfolioView}
            onPortfolioCreate={handlePortfolioCreate}
            userId="current-user"
          />
        </div>
      </div>
    </PageLayout>
  );
}