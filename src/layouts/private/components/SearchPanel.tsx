"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  Folder,
  CheckSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { SearchDropdown, SearchResult, SavedSearch, SearchTab } from "@/components/ui/SearchDropdown";
import { useSearch } from "@/hooks/useSearch";
import { SearchEntity, SearchTask, SearchProject, SearchUser, SearchTeam } from "@/types/search";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  className?: string;
  scope?: 'my' | 'team' | 'organization' | 'all';
}

const SEARCH_TABS: SearchTab[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "people", label: "People", icon: Users },
  { id: "teams", label: "Teams", icon: Users }, // Changed from Portfolios to Teams
];

// Map our search entities to UI tabs (aligned with backend implementation)
const TAB_TO_ENTITY_MAP: Record<string, SearchEntity> = {
  tasks: 'tasks',
  projects: 'projects',
  people: 'users',
  teams: 'teams', // Changed from portfolios to teams
};

export default function SearchPanel({
  onSearch,
  className = "",
  scope = 'all'
}: SearchPanelProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    // Return the value if found, otherwise return a fallback
    return value || "";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use real search hook with all implemented features - OPTIMIZED
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: isSearching,
    error: searchError,
    suggestions,
    searchHistory,
    smartSuggestions,
    search,
    quickSearch,
    clearResults,
    clearHistory,
    retry,
    loadMore
  } = useSearch({
    entities: [TAB_TO_ENTITY_MAP[activeTab]],
    autoSearch: true, // ENABLE auto-search to trigger suggestions
    debounceMs: 500, // Increase debounce time
    enableHistory: true,
    enableSuggestions: true, // ENABLE smart suggestions since backend endpoint is available
    defaultScope: scope,
    pageSize: 20
  });

  // Transform API results to UI format (aligned with backend DTO structure)
  const transformedResults = useMemo(() => {
    if (!searchResults) return [];

    const entityKey = TAB_TO_ENTITY_MAP[activeTab] as keyof typeof searchResults;
    const entityResults = searchResults[entityKey];

    if (!entityResults?.content) return [];

    return entityResults.content.map((item: any): SearchResult => {
      switch (activeTab) {
        case 'tasks':
          const task = item as SearchTask;
          return {
            id: task.id.toString(),
            title: task.title,
            type: 'task',
            description: task.description || `Assigned to: ${task.assigneeName}`,
            avatar: task.assigneeName?.slice(0, 2).toUpperCase() || 'T',
            metadata: {
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              projectName: task.projectName
            }
          };

        case 'projects':
          const project = item as SearchProject;
          return {
            id: project.id.toString(),
            title: project.name,
            type: 'project',
            description: project.description || `Owner: ${project.ownerName}`,
            avatar: project.name?.slice(0, 2).toUpperCase() || 'P',
            metadata: {
              status: project.status,
              memberCount: project.memberCount,
              completion: project.completionPercentage
            }
          };

        case 'people':
          const user = item as SearchUser;
          return {
            id: user.id.toString(),
            title: user.fullName,
            type: 'people',
            description: user.jobTitle || user.email,
            avatar: user.avatar || user.fullName?.slice(0, 2).toUpperCase() || 'U',
            metadata: {
              department: user.department,
              isActive: user.isActive,
              email: user.email
            }
          };

        case 'teams':
          const team = item as SearchTeam;
          return {
            id: team.id.toString(),
            title: team.name,
            type: 'team', // Changed from 'portfolio' to 'team'
            description: team.description || `${team.memberCount} members`,
            avatar: team.name?.slice(0, 2).toUpperCase() || 'T',
            metadata: {
              type: team.type,
              memberCount: team.memberCount,
              department: team.department,
              performanceScore: team.performanceScore
            }
          };

        default:
          return {
            id: item.id?.toString() || Math.random().toString(),
            title: item.title || item.name || 'Unknown',
            type: activeTab as any,
            description: item.description || '',
            avatar: 'U'
          };
      }
    });
  }, [searchResults, activeTab]);

  // Transform search history to recent items
  const recentItems = useMemo(() => {
    // Ensure searchHistory is an array before calling slice
    if (!Array.isArray(searchHistory)) {
      return [];
    }

    return searchHistory.slice(0, 5).map((historyItem): SearchResult => ({
      id: historyItem.id,
      title: historyItem.query,
      type: 'recent',
      description: `${historyItem.resultCount} results • ${new Date(historyItem.timestamp).toLocaleDateString()}`,
      avatar: 'H'
    }));
  }, [searchHistory]);

  // Transform search history to saved searches format
  const transformedSavedSearches = useMemo((): SavedSearch[] => {
    // Ensure searchHistory is an array before calling map
    if (!Array.isArray(searchHistory)) {
      return [];
    }
    return searchHistory.map((historyItem) => ({
      id: historyItem.id,
      title: historyItem.query,
      description: `${historyItem.resultCount} results • ${new Date(historyItem.timestamp).toLocaleDateString()}`,
      icon: Clock, // Use Clock icon for history items
    }));
  }, [searchHistory]);

  // Keyboard shortcuts and click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearch(value);

      // Only open panel if value has content
      if (value.trim()) {
        setIsOpen(true);
        // Trigger search with debouncing handled by useSearch hook
        search(value);
      } else {
        setIsOpen(false);
        clearResults();
      }
    },
    [onSearch, setSearchQuery, search, clearResults] // Remove searchQuery from dependencies to prevent stale closure
  );

  const handleOpenPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);

    // Only trigger search if there's a query AND tab actually changed
    if (searchQuery.trim() && tabId !== activeTab) {
      // Clear previous results first
      clearResults();

      // Trigger new search with delay to prevent spam
      setTimeout(() => {
        search(searchQuery);
      }, 300);
    }
  }, [searchQuery, search, activeTab, clearResults]); // Fixed dependencies

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigate to:", result.type, result.id);

    // Enhanced navigation with proper Next.js router
    switch (result.type) {
      case 'task':
        router.push(`/tasks/${result.id}`);
        break;
      case 'project':
        router.push(`/projects/${result.id}`);
        break;
      case 'people':
        router.push(`/profile/${result.id}`);
        break;
      case 'team':
        router.push(`/teams/${result.id}`);
        break;
      case 'recent':
        // Re-execute recent search
        setSearchQuery(result.title);
        break;
    }

    setIsOpen(false);
  }, [router, setSearchQuery]);

  const handleSavedSearchClick = useCallback(async (savedSearch: SavedSearch) => {
    console.log("Execute saved search:", savedSearch.id);

    // Execute predefined searches using backend API format
    switch (savedSearch.id) {
      case 's1':
        // My assigned tasks - using proper API query format
        await quickSearch('assignee:me');
        setActiveTab('tasks');
        break;
      case 's2':
        // Recently completed tasks
        await quickSearch('status:completed');
        setActiveTab('tasks');
        break;
      case 's3':
        // High priority items
        await quickSearch('priority:high OR priority:urgent');
        setActiveTab('tasks');
        break;
    }

    setIsOpen(true);
  }, [quickSearch]);

  const handleRecentClick = useCallback((item: SearchResult) => {
    console.log("Execute recent search:", item.title);
    setSearchQuery(item.title);
    setIsOpen(true);
  }, [setSearchQuery]);

  const handleRetry = useCallback(async () => {
    await retry();
  }, [retry]);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
  }, [clearHistory]);

  const handleLoadMore = useCallback(async () => {
    await loadMore(TAB_TO_ENTITY_MAP[activeTab]);
  }, [loadMore, activeTab]);

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleOpenPanel}
        placeholder={undefined} // Let SearchInput handle the translation internally
        showShortcut={true}
        size="md"
        variant="default"
        className="max-w-2xl mx-auto"
      />

      {/* Enhanced error state with retry functionality */}
      {searchError && (
        <div
          className="absolute top-full left-0 right-0 mt-1 border rounded-lg p-3 z-50"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ color: theme.status.error }}>
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{searchError}</span>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center px-2 py-1 text-xs transition-colors rounded"
              style={{
                color: theme.status.error,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.muted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {t('search.retry') || 'Retry'}
            </button>
          </div>
        </div>
      )}

      <SearchDropdown
        isOpen={isOpen && !searchError}
        searchQuery={searchQuery}
        searchResults={transformedResults}
        recentItems={recentItems}
        savedSearches={transformedSavedSearches}
        isSearching={isSearching}
        activeTab={activeTab}
        tabs={SEARCH_TABS}
        onTabChange={handleTabChange}
        onResultClick={handleResultClick}
        onSavedSearchClick={handleSavedSearchClick}
        onRecentClick={handleRecentClick}
        position="center"
        // Enhanced functionality aligned with backend implementation
        suggestions={suggestions}
        smartSuggestions={smartSuggestions}
        onClearHistory={handleClearHistory}
        showLoadMore={searchResults?.[TAB_TO_ENTITY_MAP[activeTab] as keyof typeof searchResults]?.hasNext}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
