"use client";

import React from "react";
import { PageLayout } from "@/layouts/page";
import { 
  PortfoliosCard, 
  PortfolioStatsWidget 
} from "../components";
import { useOptimizedPortfolios } from "../hooks";
import { type Portfolio } from "@/hooks";

// Starred Portfolios Page - Using PageLayout with navigation
export default function StarredPortfoliosPage() {
  // Use optimized hook specifically for starred portfolios
  const { 
    stats,
    handlers 
  } = useOptimizedPortfolios({
    userId: 'current-user',
    initialLimit: 12, // Show more for starred view
    showBrowseAll: true,
    defaultTab: 'starred'
  });

  // Event Handlers - Clean & Reusable
  const handlePortfolioView = (portfolio: Portfolio) => {
    console.log('Navigating to portfolio:', portfolio.name);
    handlers.viewPortfolio(portfolio);
  };

  const handlePortfolioCreate = (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Portfolio created:', portfolioData.name);
    handlers.createPortfolio(portfolioData);
  };

  // Listen to header actions
  React.useEffect(() => {
    const handleBrowseAll = () => {
      console.log('Browse all clicked from header');
    };

    const handleCreate = () => {
      console.log('Create portfolio clicked from header');
      // Trigger create action
      handlers.createPortfolio({
        name: "New Starred Portfolio",
        color: "#f97316", // Orange
        status: 'active',
        starred: true, // Auto-starred since we're on starred page
        category: 'personal',
        projectsCount: 0,
        tasksCount: 0,
        progress: 0,
        description: "A new portfolio created from starred page",
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
        {/* Stats Widget */}
        <PortfolioStatsWidget 
          stats={stats}
          showDetailed={true}
        />

        {/* Main Portfolios Card - Focused on starred */}
        <PortfoliosCard
          initialTab="starred"
          viewMode="grid"
          showBrowseAll={true}
          onPortfolioView={handlePortfolioView}
          onPortfolioCreate={handlePortfolioCreate}
          userId="current-user"
        />
      </div>
    </PageLayout>
  );
}