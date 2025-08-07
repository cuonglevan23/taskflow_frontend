"use client";

import React from "react";
import { PageLayout } from "@/layouts/page";
import { PortfolioBrowseAllView } from "../components";
import { useOptimizedPortfolios } from "../hooks";
import { type Portfolio } from "@/hooks";

// Browse All Portfolios Page - Table view like the image
export default function BrowseAllPortfoliosPage() {
  // Use optimized hook for browse all - no limits
  const { 
    portfolioData,
    handlers,
    isLoading 
  } = useOptimizedPortfolios({
    userId: 'current-user',
    initialLimit: 100, // Show all portfolios
    showBrowseAll: true,
    defaultTab: 'recent'
  });

  // Event Handlers - Clean & Reusable
  const handlePortfolioClick = (portfolio: Portfolio) => {
    console.log('Navigating to portfolio:', portfolio.name);
    handlers.viewPortfolio(portfolio);
    // In real app: router.push(`/portfolios/${portfolio.id}`)
  };

  // Get all portfolios (both recent and starred)
  const allPortfolios = [
    ...portfolioData.recent.portfolios,
    ...portfolioData.starred.portfolios.filter(
      starred => !portfolioData.recent.portfolios.find(recent => recent.id === starred.id)
    )
  ];

  return (
    <PageLayout>
      <PortfolioBrowseAllView
        portfolios={allPortfolios}
        onPortfolioClick={handlePortfolioClick}
        loading={isLoading}
      />
    </PageLayout>
  );
}