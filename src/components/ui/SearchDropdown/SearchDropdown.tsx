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
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import Button from "@/components/ui/Button/Button";
import { DARK_THEME } from "@/constants/theme";

export interface SearchResult {
  id: string;
  title: string;
  type: "task" | "project" | "people" | "goal";
  description?: string;
  avatar?: string;
  completed?: boolean;
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
      case "goal":
        return Target;
      default:
        return CheckSquare;
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
        <p className="text-sm font-medium truncate" style={{ color: DARK_THEME.search.text }}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs truncate" style={{ color: DARK_THEME.search.placeholder }}>
            {item.description}
          </p>
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

const SearchDropdown = ({
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
}) => {
  if (!isOpen) return null;

  const positionClasses = {
    center: "left-1/2 transform -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  };

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
        {searchQuery.trim() ? (
          <div className="p-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold mb-4 capitalize" style={{ color: DARK_THEME.search.text }}>
                  {activeTab} ({searchResults.length})
                </h3>
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      item={result}
                      onClick={() => onResultClick(result)}
                    />
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t" style={{ borderColor: DARK_THEME.search.border }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <Search size={14} />
                    <span>↵ Return to view all results</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-2" style={{ color: DARK_THEME.search.placeholder }}>
                  <Search size={24} className="mx-auto" />
                </div>
                <p className="text-sm" style={{ color: DARK_THEME.search.placeholder }}>
                  No results found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Recent Items */}
            {recentItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-4" style={{ color: DARK_THEME.search.text }}>
                  Recents
                </h3>
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
            {savedSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: DARK_THEME.search.text }}>
                  Saved searches
                </h3>
                <div className="space-y-1">
                  {savedSearches.map((search) => (
                    <button
                      key={search.id}
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
                      onClick={() => onSavedSearchClick(search)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center" style={{ color: DARK_THEME.search.placeholder }}>
                        <search.icon size={16} />
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;