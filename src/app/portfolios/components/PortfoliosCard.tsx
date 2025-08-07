"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type ActionButtonConfig, type TabConfig } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui";
import { 
  FaPlus, 
  FaStar, 
  FaRegStar,
  FaProjectDiagram,
  FaTasks
} from "react-icons/fa";
import { 
  HiSparkles,
  HiViewGrid,
  HiViewList
} from "react-icons/hi";
import { usePortfolios, type Portfolio } from "@/hooks";

// Portfolio Item Component - Reusable & Optimized
const PortfolioItem = ({ 
  portfolio, 
  onToggleStar, 
  onView, 
  viewMode = 'grid' 
}: { 
  portfolio: Portfolio;
  onToggleStar: (id: string) => void;
  onView: (portfolio: Portfolio) => void;
  viewMode?: 'grid' | 'list';
}) => {
  const { theme } = useTheme();

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer hover:bg-opacity-50 border"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
        onClick={() => onView(portfolio)}
      >
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: portfolio.color }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 
              className="text-sm font-medium truncate"
              style={{ color: theme.text.primary }}
            >
              {portfolio.name}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(portfolio.id);
              }}
              className="p-1 hover:bg-opacity-20 hover:bg-orange-500 rounded transition-colors"
            >
              {portfolio.starred ? (
                <FaStar className="w-4 h-4 text-orange-500" />
              ) : (
                <FaRegStar className="w-4 h-4" style={{ color: theme.text.secondary }} />
              )}
            </button>
          </div>
          {portfolio.description && (
            <p 
              className="text-xs truncate mt-1"
              style={{ color: theme.text.secondary }}
            >
              {portfolio.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: theme.text.secondary }}>
            <span className="flex items-center gap-1">
              <FaProjectDiagram className="w-3 h-3" />
              {portfolio.projectsCount}
            </span>
            <span className="flex items-center gap-1">
              <FaTasks className="w-3 h-3" />
              {portfolio.tasksCount}
            </span>
            <span>{portfolio.progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 border group"
      style={{ 
        backgroundColor: portfolio.color + '10',
        borderColor: portfolio.color + '30'
      }}
      onClick={() => onView(portfolio)}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: portfolio.color }}
        >
          <FaProjectDiagram className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(portfolio.id);
          }}
          className="p-1 hover:bg-opacity-20 hover:bg-orange-500 rounded transition-colors"
        >
          {portfolio.starred ? (
            <FaStar className="w-4 h-4 text-orange-500" />
          ) : (
            <FaRegStar className="w-4 h-4" style={{ color: theme.text.secondary }} />
          )}
        </button>
      </div>
      
      <div>
        <h4 
          className="font-semibold text-sm mb-1 truncate"
          style={{ color: theme.text.primary }}
        >
          {portfolio.name}
        </h4>
        {portfolio.description && (
          <p 
            className="text-xs mb-3 line-clamp-2"
            style={{ color: theme.text.secondary }}
          >
            {portfolio.description}
          </p>
        )}
        
        <div className="space-y-1 text-xs" style={{ color: theme.text.secondary }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <FaProjectDiagram className="w-3 h-3" />
              {portfolio.projectsCount}
            </span>
            <span>{portfolio.progress}%</span>
          </div>
          <div className="flex items-center gap-1">
            <FaTasks className="w-3 h-3" />
            {portfolio.tasksCount}
          </div>
        </div>
        
        <div className="mt-2">
          <div 
            className="h-1.5 rounded-full"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: portfolio.color,
                width: `${portfolio.progress}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Portfolio Button Component - Reusable
const CreatePortfolioButton = ({ 
  onClick, 
  viewMode = 'grid' 
}: { 
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}) => {
  const { theme } = useTheme();
  
  if (viewMode === 'list') {
    return (
      <button 
        onClick={onClick}
        className="flex items-center gap-4 p-3 border-2 border-dashed rounded-lg transition-colors"
        style={{ borderColor: theme.border.default }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <FaPlus className="w-3 h-3" style={{ color: theme.text.secondary }} />
        </div>
        <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
          Create portfolio
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-32 transition-colors p-4"
      style={{ borderColor: theme.border.default }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <FaPlus 
        className="w-5 h-5 mb-2"
        style={{ color: theme.text.secondary }}
      />
      <span 
        className="text-sm font-medium"
        style={{ color: theme.text.secondary }}
      >
        Create portfolio
      </span>
      <span 
        className="text-xs mt-1 text-center"
        style={{ color: theme.text.secondary }}
      >
        Organize projects
      </span>
    </button>
  );
};

// Portfolio View Controls Component - Reusable
const PortfolioViewControls = ({
  viewMode,
  onViewModeChange,
  showBrowseAll,
  onBrowseAllToggle
}: {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showBrowseAll: boolean;
  onBrowseAllToggle: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: theme.border.default }}>
        <button
          onClick={() => onViewModeChange('grid')}
          className="p-2 transition-colors"
          style={{
            backgroundColor: viewMode === 'grid' ? '#f97316' : theme.background.primary,
            color: viewMode === 'grid' ? 'white' : theme.text.secondary,
          }}
        >
          <HiViewGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className="p-2 transition-colors"
          style={{
            backgroundColor: viewMode === 'list' ? '#f97316' : theme.background.primary,
            color: viewMode === 'list' ? 'white' : theme.text.secondary,
          }}
        >
          <HiViewList className="w-4 h-4" />
        </button>
      </div>
      
      <Button 
        variant={showBrowseAll ? "primary" : "outline"}
        size="sm"
        onClick={onBrowseAllToggle}
        className="flex items-center gap-2"
      >
        <HiSparkles className="w-4 h-4" />
        {showBrowseAll ? 'Show Less' : 'Browse All'}
      </Button>
    </div>
  );
};

// Empty State Component - Reusable
const EmptyPortfoliosState = ({
  activeTab,
  onCreateClick
}: {
  activeTab: 'recent' | 'starred';
  onCreateClick: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <div className="text-center py-12">
      <FaProjectDiagram 
        className="w-12 h-12 mx-auto mb-4"
        style={{ color: theme.text.secondary }}
      />
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: theme.text.primary }}
      >
        No {activeTab} portfolios
      </h3>
      <p 
        className="text-sm mb-4"
        style={{ color: theme.text.secondary }}
      >
        {activeTab === 'starred' 
          ? 'Star portfolios to see them here' 
          : 'Create your first portfolio to get started'
        }
      </p>
      <Button onClick={onCreateClick}>
        Create Portfolio
      </Button>
    </div>
  );
};

// Main PortfoliosCard Component - Professional & Modular
interface PortfoliosCardProps {
  initialTab?: 'recent' | 'starred';
  viewMode?: 'grid' | 'list';
  showBrowseAll?: boolean;
  onPortfolioView?: (portfolio: Portfolio) => void;
  onPortfolioCreate?: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => void;
  userId?: string; // Multi-user support
}

const PortfoliosCard = ({
  initialTab = 'recent',
  viewMode: initialViewMode = 'grid',
  showBrowseAll: initialShowBrowseAll = false,
  onPortfolioView,
  onPortfolioCreate,
  userId
}: PortfoliosCardProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'recent' | 'starred'>(initialTab);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showBrowseAll, setShowBrowseAll] = useState(initialShowBrowseAll);

  // Optimized hooks with proper configs
  const { addPortfolio, toggleStar } = usePortfolios({ userId });

  const {
    portfolios: recentPortfolios,
    displayedPortfolios: displayedRecent,
    hasMorePortfolios: hasMoreRecent,
    toggleShowAll: toggleShowAllRecent,
  } = usePortfolios({
    initialLimit: showBrowseAll ? 20 : 6,
    filterStarred: false,
    sortBy: 'updatedAt',
    userId
  });

  const {
    portfolios: starredPortfolios,
    displayedPortfolios: displayedStarred,
    hasMorePortfolios: hasMoreStarred,
    toggleShowAll: toggleShowAllStarred,
  } = usePortfolios({
    initialLimit: showBrowseAll ? 20 : 6,
    filterStarred: true,
    sortBy: 'updatedAt',
    userId
  });

  // Tab Configuration
  const tabs: TabConfig[] = [
    { key: 'recent', label: 'Recent', count: recentPortfolios.length },
    { key: 'starred', label: 'Starred', count: starredPortfolios.length },
  ];

  // Current data based on active tab
  const currentPortfolios = activeTab === 'recent' ? displayedRecent : displayedStarred;
  const hasMore = activeTab === 'recent' ? hasMoreRecent : hasMoreStarred;
  const toggleShowAll = activeTab === 'recent' ? toggleShowAllRecent : toggleShowAllStarred;

  // Event Handlers - Optimized & Reusable
  const handleCreatePortfolio = () => {
    const newPortfolio = {
      name: "New Portfolio",
      color: "#8b5cf6",
      status: 'active' as const,
      starred: false,
      category: 'personal' as const,
      projectsCount: 0,
      tasksCount: 0,
      progress: 0,
      description: "A new portfolio to organize projects",
    };
    
    addPortfolio(newPortfolio);
    onPortfolioCreate?.(newPortfolio);
  };

  const handleToggleStar = (id: string) => {
    toggleStar(id);
  };

  const handleViewPortfolio = (portfolio: Portfolio) => {
    onPortfolioView?.(portfolio);
  };

  const handleMenuClick = () => {
    console.log("Portfolios menu clicked");
  };

  // BaseCard Configuration
  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: "Create portfolio",
    onClick: handleCreatePortfolio
  };

  const showMoreButton = {
    show: hasMore && !showBrowseAll,
    onClick: toggleShowAll
  };

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex justify-end">
        <PortfolioViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showBrowseAll={showBrowseAll}
          onBrowseAllToggle={() => setShowBrowseAll(!showBrowseAll)}
        />
      </div>

      {/* Main Portfolio Card */}
      <BaseCard
        title="My Portfolios"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as 'recent' | 'starred')}
        createAction={createAction}
        showMoreButton={showMoreButton}
        onMenuClick={handleMenuClick}
        className="min-h-[600px]"
      >
        <div className="space-y-4">
          {/* Portfolios Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <CreatePortfolioButton onClick={handleCreatePortfolio} viewMode="grid" />
              {currentPortfolios.map((portfolio) => (
                <PortfolioItem
                  key={portfolio.id}
                  portfolio={portfolio}
                  onToggleStar={handleToggleStar}
                  onView={handleViewPortfolio}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <CreatePortfolioButton onClick={handleCreatePortfolio} viewMode="list" />
              {currentPortfolios.map((portfolio) => (
                <PortfolioItem
                  key={portfolio.id}
                  portfolio={portfolio}
                  onToggleStar={handleToggleStar}
                  onView={handleViewPortfolio}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {currentPortfolios.length === 0 && (
            <EmptyPortfoliosState
              activeTab={activeTab}
              onCreateClick={handleCreatePortfolio}
            />
          )}
        </div>
      </BaseCard>
    </div>
  );
};

export default PortfoliosCard;