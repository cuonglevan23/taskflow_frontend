"use client";

import React, { useState, useCallback } from "react";
import {
  Search,
  CheckSquare,
  Folder,
  Users,
  Briefcase,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Loader2,
  History,
  Trash2,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import Button from "@/components/ui/Button/Button";
import { DARK_THEME } from "@/constants/theme";

export interface SearchResult {
  id: string;
  title: string;
  type: "task" | "project" | "people" | "portfolio" | "team" | "recent" | "goal";
  description?: string;
  avatar?: string;
  completed?: boolean;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: string;
    projectName?: string;
    memberCount?: number;
    completion?: number;
    department?: string;
    isActive?: boolean;
    email?: string;
    type?: string;
    performanceScore?: number;
  };
}

export interface SavedSearch {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface SearchTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface SmartSuggestion {
  id: string;
  type: string;
  text: string;
}

export interface SearchDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  recentItems: SearchResult[];
  savedSearches: SavedSearch[];
  isSearching: boolean;
  activeTab: string;
  tabs: SearchTab[];
  onTabChange: (tabId: string) => void;
  onResultClick: (result: SearchResult) => void;
  onSavedSearchClick: (search: SavedSearch) => void;
  onRecentClick: (item: SearchResult) => void;
  className?: string;
  position?: "center" | "left" | "right";
  // Enhanced props for AI suggestions
  suggestions?: string[];
  smartSuggestions?: SmartSuggestion[]; // Updated to use proper SmartSuggestion interface
  onClearHistory?: () => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  onSmartSuggestionClick?: (suggestion: SmartSuggestion) => void; // New handler for smart suggestions
}

const SearchResultItem = ({
  item,
  onClick,
}: {
  item: SearchResult;
  onClick: () => void;
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckSquare;
      case "project":
        return Folder;
      case "people":
        return Users;
      case "portfolio":
        return Briefcase;
      case "team":
        return Users;
      case "goal":
        return Target;
      case "recent":
        return History;
      default:
        return CheckSquare;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'TODO':
        return '#6B7280';
      case 'IN_PROGRESS':
        return '#3B82F6';
      case 'COMPLETED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return DARK_THEME.search.placeholder;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'LOW':
        return '#6B7280';
      case 'MEDIUM':
        return '#F59E0B';
      case 'HIGH':
        return '#F97316';
      case 'URGENT':
        return '#EF4444';
      default:
        return DARK_THEME.search.placeholder;
    }
  };

  const IconComponent = getTypeIcon(item.type);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors group"
      style={{
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundStrong;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {item.avatar ? (
        <UserAvatar name={item.avatar} size="sm" className="w-6 h-6" />
      ) : (
        <div className="w-6 h-6 flex items-center justify-center" style={{ color: DARK_THEME.search.placeholder }}>
          <IconComponent size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate" style={{ color: DARK_THEME.search.text }}>
            {item.title}
          </p>

          {/* Status badges */}
          {item.metadata?.status && (
            <span
              className="px-1.5 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: getStatusColor(item.metadata.status) + '20',
                color: getStatusColor(item.metadata.status)
              }}
            >
              {item.metadata.status.replace('_', ' ')}
            </span>
          )}

          {item.metadata?.priority && (
            <span
              className="px-1.5 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: getPriorityColor(item.metadata.priority) + '20',
                color: getPriorityColor(item.metadata.priority)
              }}
            >
              {item.metadata.priority}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-xs truncate mt-1" style={{ color: DARK_THEME.search.placeholder }}>
            {item.description}
          </p>
        )}

        {/* Additional metadata */}
        {item.metadata && (
          <div className="flex items-center space-x-2 mt-1 text-xs" style={{ color: DARK_THEME.search.placeholder }}>
            {item.metadata.projectName && <span>📁 {item.metadata.projectName}</span>}
            {item.metadata.memberCount && <span>👥 {item.metadata.memberCount} members</span>}
            {item.metadata.completion !== undefined && <span>📊 {item.metadata.completion}%</span>}
            {item.metadata.department && <span>🏢 {item.metadata.department}</span>}
            {item.metadata.dueDate && <span>📅 {new Date(item.metadata.dueDate).toLocaleDateString()}</span>}
          </div>
        )}
      </div>
    </button>
  );
};

const TabButton = ({
  tab,
  isActive,
  onClick,
}: {
  tab: SearchTab;
  isActive: boolean;
  onClick: () => void;
}) => {
  const IconComponent = tab.icon;
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border"
      style={{
        backgroundColor: isActive ? DARK_THEME.search.focus + '20' : 'transparent',
        color: isActive ? DARK_THEME.search.focus : DARK_THEME.search.placeholder,
        borderColor: isActive ? DARK_THEME.search.focus : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundStrong;
          e.currentTarget.style.color = DARK_THEME.search.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = DARK_THEME.search.placeholder;
        }
      }}
    >
      <IconComponent size={14} />
      <span>{tab.label}</span>
    </button>
  );
};

const SuggestionItem = ({
  suggestion,
  type,
  onClick,
}: {
  suggestion: string;
  type: 'autocomplete' | 'smart';
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors group"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundStrong;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="w-4 h-4 flex items-center justify-center" style={{ color: DARK_THEME.search.placeholder }}>
        {type === 'smart' ? <Sparkles size={14} /> : <TrendingUp size={14} />}
      </div>
      <span className="text-sm" style={{ color: DARK_THEME.search.text }}>
        {suggestion}
      </span>
    </button>
  );
};

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  searchQuery,
  searchResults,
  recentItems,
  savedSearches,
  isSearching,
  activeTab,
  tabs,
  onTabChange,
  onResultClick,
  onSavedSearchClick,
  onRecentClick,
  className = "",
  position = "center",
  suggestions = [],
  smartSuggestions = [],
  onClearHistory,
  showLoadMore = false,
  onLoadMore,
  onSmartSuggestionClick, // Destructure new prop
}) => {
  if (!isOpen) return null;

  const positionClasses = {
    center: "left-1/2 transform -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  };

  const hasResults = searchResults.length > 0;
  const hasSuggestions = suggestions.length > 0 || smartSuggestions.length > 0;
  const hasRecentItems = recentItems.length > 0;
  const hasSavedSearches = savedSearches.length > 0;

  return (
    <div
      className={`absolute top-full ${positionClasses[position]} mt-2 rounded-xl overflow-hidden z-[100] ${className}`}
      style={{
        backgroundColor: DARK_THEME.search.backgroundActive,
        borderColor: DARK_THEME.search.border,
        borderWidth: '1px',
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        minWidth: "600px",
        maxWidth: "90vw",
        maxHeight: "80vh",
      }}
    >
      {/* Tabs */}
      <div className="px-6 pt-6 border-b" style={{ borderColor: DARK_THEME.search.border }}>
        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={16} style={{ color: DARK_THEME.search.focus }} />
            <span className="text-sm" style={{ color: DARK_THEME.search.placeholder }}>
              Searching...
            </span>
          </div>
        )}

        {/* Suggestions */}
        {!isSearching && searchQuery && hasSuggestions && (
          <div className="p-4 border-b" style={{ borderColor: DARK_THEME.search.border }}>
            <h3 className="text-xs font-medium mb-2" style={{ color: DARK_THEME.search.placeholder }}>
              Suggestions
            </h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`autocomplete-${index}`}
                  suggestion={suggestion}
                  type="autocomplete"
                  onClick={() => {
                    // This would trigger a new search with the suggestion
                    console.log('Select suggestion:', suggestion);
                  }}
                />
              ))}
              {smartSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`smart-${suggestion.id}-${index}`}
                  suggestion={suggestion.text}
                  type="smart"
                  onClick={() => {
                    // Handle smart suggestion click
                    if (onSmartSuggestionClick) {
                      onSmartSuggestionClick(suggestion);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isSearching && searchQuery && hasResults && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium" style={{ color: DARK_THEME.search.placeholder }}>
                Results for "{searchQuery}"
              </h3>
              <span className="text-xs" style={{ color: DARK_THEME.search.placeholder }}>
                {searchResults.length} results
              </span>
            </div>
            <div className="space-y-1">
              {searchResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  item={result}
                  onClick={() => onResultClick(result)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {showLoadMore && onLoadMore && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: DARK_THEME.search.border }}>
                <button
                  onClick={onLoadMore}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: DARK_THEME.search.focus
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundStrong;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="text-sm">Load more results</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isSearching && searchQuery && !hasResults && !hasSuggestions && (
          <div className="flex flex-col items-center justify-center py-8">
            <Search size={24} style={{ color: DARK_THEME.search.placeholder }} className="mb-2" />
            <p className="text-sm" style={{ color: DARK_THEME.search.placeholder }}>
              No results found for "{searchQuery}"
            </p>
            <p className="text-xs mt-1" style={{ color: DARK_THEME.search.placeholder }}>
              Try adjusting your search terms
            </p>
          </div>
        )}

        {/* Recent Items */}
        {!searchQuery && hasRecentItems && (
          <div className="p-4 border-b" style={{ borderColor: DARK_THEME.search.border }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium" style={{ color: DARK_THEME.search.placeholder }}>
                Recent searches
              </h3>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="text-xs transition-colors"
                  style={{ color: DARK_THEME.search.placeholder }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = DARK_THEME.search.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = DARK_THEME.search.placeholder;
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {recentItems.map((item) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  onClick={() => onRecentClick(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {!searchQuery && hasSavedSearches && (
          <div className="p-4">
            <h3 className="text-xs font-medium mb-3" style={{ color: DARK_THEME.search.placeholder }}>
              Saved searches
            </h3>
            <div className="space-y-1">
              {savedSearches.map((search) => {
                const IconComponent = search.icon;
                return (
                  <button
                    key={search.id}
                    onClick={() => onSavedSearchClick(search)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors group"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="w-6 h-6 flex items-center justify-center" style={{ color: DARK_THEME.search.focus }}>
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: DARK_THEME.search.text }}>
                        {search.title}
                      </p>
                      <p className="text-xs truncate" style={{ color: DARK_THEME.search.placeholder }}>
                        {search.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;
