'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Clock, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { SearchEntity, SearchFilters } from '@/types/search';
import SearchResults from './SearchResults';
import SearchFiltersPanel from './SearchFiltersPanel';
import SearchSuggestions from './SearchSuggestions';
import SearchHistory from './SearchHistory';
import { cn } from '@/lib/utils';

interface SearchPanelProps {
  className?: string;
  placeholder?: string;
  entities?: SearchEntity[];
  defaultFilters?: SearchFilters;
  showFilters?: boolean;
  showHistory?: boolean;
  showQuickActions?: boolean;
  enableRetry?: boolean;
  enableSmartSuggestions?: boolean;
  onResultSelect?: (item: any, type: SearchEntity) => void;
  autoFocus?: boolean;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  className,
  placeholder = "Search tasks, projects, users, teams...",
  entities = ['tasks', 'projects', 'users', 'teams'],
  defaultFilters = {},
  showFilters = true,
  showHistory = true,
  showQuickActions = true,
  enableRetry = true,
  enableSmartSuggestions = true,
  onResultSelect,
  autoFocus = false
}) => {
  const [showResults, setShowResults] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(defaultFilters);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    query,
    setQuery,
    results,
    loading,
    error,
    suggestions,
    searchHistory,
    smartSuggestions,
    search,
    quickSearch,
    advancedSearch,
    clearResults,
    clearHistory,
    removeFromHistory,
    loadMore,
    retry
  } = useSearch({
    entities,
    filters: activeFilters,
    autoSearch: true,
    debounceMs: 300,
    enableHistory: showHistory,
    enableSuggestions: enableSmartSuggestions
  });

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFiltersPanel(false);
        setShowHistoryPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setShowResults(true);
      setShowHistoryPanel(false);
    } else {
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    } else if (showHistory && searchHistory.length > 0) {
      setShowHistoryPanel(true);
    }
    setShowFiltersPanel(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowResults(true);
    searchInputRef.current?.focus();
  };

  const handleHistorySelect = (historyItem: any) => {
    setQuery(historyItem.query);
    setShowHistoryPanel(false);
    setShowResults(true);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setActiveFilters(newFilters);
    // Use advanced search with new filters
    if (query.trim() || Object.keys(newFilters).length > 0) {
      advancedSearch(newFilters);
    }
  };

  const handleQuickSearch = async (quickQuery: string) => {
    setQuery(quickQuery);
    await quickSearch(quickQuery);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setQuery('');
    clearResults();
    setShowResults(false);
    setShowFiltersPanel(false);
    setShowHistoryPanel(false);
    searchInputRef.current?.focus();
  };

  const handleResultSelect = (item: any, type: SearchEntity) => {
    onResultSelect?.(item, type);
    setShowResults(false);
    // Navigate to user profile page if the selected entity is a user
    if (type === 'users') {
      router.push(`/profile/${item.id}`);
    }
  };

  const handleLoadMore = async (entity: SearchEntity) => {
    await loadMore(entity);
  };

  const handleRetry = async () => {
    await retry();
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    await removeFromHistory(historyId);
  };

  const hasActiveFilters = Object.values(activeFilters).some(filter =>
    filter && Object.keys(filter).length > 0
  );

  // Smart suggestions from AI
  const allSuggestions = [
    ...suggestions.map(s => ({ text: s, type: 'autocomplete' })),
    ...smartSuggestions.map(s => ({ text: s.text, type: 'smart', id: s.id }))
  ];

  return (
    <div ref={searchPanelRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className={cn(
                "w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder-gray-500 text-sm",
                "transition-all duration-200",
                loading && "pr-20",
                error && "border-red-300 focus:ring-red-500"
              )}
            />

            {/* Loading indicator */}
            {loading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Clear button */}
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter button */}
          {showFilters && (
            <button
              onClick={() => {
                setShowFiltersPanel(!showFiltersPanel);
                setShowResults(false);
                setShowHistoryPanel(false);
              }}
              className={cn(
                "ml-2 px-3 py-3 border border-gray-300 rounded-lg",
                "hover:bg-gray-50 transition-colors",
                showFiltersPanel && "bg-blue-50 border-blue-300",
                hasActiveFilters && "bg-blue-100 border-blue-400"
              )}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </button>
          )}

          {/* Retry button */}
          {error && enableRetry && (
            <button
              onClick={handleRetry}
              className="ml-2 px-3 py-3 border border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              title="Retry search"
            >
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </button>
          )}
        </div>

        {/* Error indicator */}
        {error && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>{error}</span>
            {enableRetry && (
              <button
                onClick={handleRetry}
                className="ml-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && !query && !showResults && !showHistoryPanel && !error && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-2">Quick searches</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickSearch('my tasks')}
                  className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  My Tasks
                </button>
                <button
                  onClick={() => handleQuickSearch('urgent')}
                  className="flex items-center px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </button>
                <button
                  onClick={() => handleQuickSearch('due today')}
                  className="flex items-center px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Due Today
                </button>
                <button
                  onClick={() => handleQuickSearch('my projects')}
                  className="flex items-center px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  My Projects
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Search Suggestions with Smart Suggestions */}
      {allSuggestions.length > 0 && query && showResults && !error && (
        <SearchSuggestions
          suggestions={allSuggestions.map(s => s.text)}
          onSuggestionSelect={handleSuggestionSelect}
          currentQuery={query}
        />
      )}

      {/* Search History with individual removal */}
      {showHistoryPanel && searchHistory.length > 0 && (
        <SearchHistory
          history={searchHistory}
          onHistorySelect={handleHistorySelect}
          onClearHistory={clearHistory}
          onRemoveItem={handleRemoveFromHistory}
        />
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <SearchFiltersPanel
          entities={entities}
          filters={activeFilters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFiltersPanel(false)}
        />
      )}

      {/* Enhanced Search Results with Load More */}
      {showResults && (query.trim() || hasActiveFilters) && !error && (
        <SearchResults
          results={results}
          loading={loading}
          error={null}
          query={query}
          onResultSelect={handleResultSelect}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
};

export default SearchPanel;
