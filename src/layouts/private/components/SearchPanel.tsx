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
  Search, // Add Search icon for global search
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
  { id: "all", label: "All", icon: Search }, // Add global search tab
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "people", label: "People", icon: Users },
  { id: "teams", label: "Teams", icon: Users },
];

// Map our search entities to UI tabs (aligned with backend implementation)
const TAB_TO_ENTITY_MAP: Record<string, SearchEntity | 'all'> = {
  all: 'all', // Add global search mapping
  tasks: 'tasks',
  projects: 'projects',
  people: 'users',
  teams: 'teams',
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
    return value || "";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Start with global search
  const [inputQuery, setInputQuery] = useState(""); // Add separate state for input query
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use real search hook with dynamic entities based on active tab
  const searchEntities = useMemo(() => {
    if (activeTab === 'all') {
      return ['tasks', 'projects', 'users', 'teams'] as SearchEntity[]; // Global search across all entities
    }
    return [TAB_TO_ENTITY_MAP[activeTab]] as SearchEntity[];
  }, [activeTab]);

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
    entities: searchEntities, // Use dynamic entities
    autoSearch: true,
    debounceMs: 500,
    enableHistory: true,
    enableSuggestions: true,
    defaultScope: scope,
    pageSize: 20
  });

  // Sync input query with search hook when entities change
  useEffect(() => {
    if (inputQuery && inputQuery !== searchQuery) {
      setSearchQuery(inputQuery);
    }
  }, [searchEntities, inputQuery, setSearchQuery]);

  // Enhanced transform API results to handle global search
  const transformedResults = useMemo(() => {
    if (!searchResults) return [];

    // For global search, combine results from all entities
    if (activeTab === 'all') {
      const allResults: SearchResult[] = [];

      // Process tasks
      if (searchResults.tasks?.content) {
        searchResults.tasks.content.forEach((task: SearchTask) => {
          allResults.push({
            id: task.id,
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
          });
        });
      }

      // Process projects
      if (searchResults.projects?.content) {
        searchResults.projects.content.forEach((project: SearchProject) => {
          allResults.push({
            id: project.id, // Fix: Use numeric id directly
            title: project.name,
            type: 'project',
            description: project.description || `Owner: ${project.ownerName}`,
            avatar: project.name?.slice(0, 2).toUpperCase() || 'P',
            metadata: {
              status: project.status,
              memberCount: project.memberCount,
              completion: project.completionPercentage
            }
          });
        });
      }

      // Process users
      if (searchResults.users?.content) {
        searchResults.users.content.forEach((user: SearchUser) => {
          allResults.push({
            id: user.id,
            title: user.fullName,
            type: 'people',
            description: user.jobTitle || user.email,
            avatar: user.avatar || user.fullName?.slice(0, 2).toUpperCase() || 'U',
            metadata: {
              department: user.department,
              isActive: user.isActive,
              email: user.email
            }
          });
        });
      }

      // Process teams
      if (searchResults.teams?.content) {
        searchResults.teams.content.forEach((team: SearchTeam) => {
          allResults.push({
            id: team.id, // Fix: Use numeric id directly
            title: team.name,
            type: 'team',
            description: team.description || `${team.memberCount} members`,
            avatar: team.name?.slice(0, 2).toUpperCase() || 'T',
            metadata: {
              type: team.type,
              memberCount: team.memberCount,
              department: team.department,
              performanceScore: team.performanceScore
            }
          });
        });
      }

      return allResults;
    }

    // Single entity search (existing logic)
    const entityKey = TAB_TO_ENTITY_MAP[activeTab] as keyof typeof searchResults;
    const entityResults = searchResults[entityKey];

    if (!entityResults?.content) return [];

    return entityResults.content.map((item: any): SearchResult => {
      switch (activeTab) {
        case 'tasks':
          const task = item as SearchTask;
          return {
            id: task.id, // Fix: Use numeric id directly
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
            id: project.id, // Fix: Use numeric id directly
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
            id: user.id, // Fix: Use numeric id directly
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
            id: team.id, // Fix: Use numeric id directly
            title: team.name,
            type: 'team',
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
            id: typeof item.id === 'number' ? item.id : parseInt(item.id) || Math.floor(Math.random() * 10000), // Fix: Ensure numeric id
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
    // Handle both array of strings and SearchHistory objects
    if (!searchHistory || !Array.isArray(searchHistory) || searchHistory.length === 0) {
      return [];
    }

    // Check if searchHistory is an array of strings (current API format)
    if (typeof searchHistory[0] === 'string') {
      return (searchHistory as unknown as string[]).slice(0, 5).map((query: string, index): SearchResult => ({
        id: index + 1,
        title: query,
        type: 'recent',
        description: `Recent search`,
        avatar: 'H'
      }));
    }

    // Handle SearchHistory object format (future API format)
    if (typeof searchHistory[0] === 'object' && searchHistory[0] !== null) {
      return searchHistory.slice(0, 5).map((historyItem: any, index): SearchResult => ({
        id: typeof historyItem.id === 'number' ? historyItem.id : parseInt(historyItem.id) || index + 1,
        title: historyItem.query,
        type: 'recent',
        description: `${historyItem.resultCount || 0} results • ${historyItem.timestamp ? new Date(historyItem.timestamp).toLocaleDateString() : 'Recent'}`,
        avatar: 'H'
      }));
    }

    return [];
  }, [searchHistory]);

  // Transform search history to saved searches format
  const transformedSavedSearches = useMemo((): SavedSearch[] => {
    // Handle both array of strings and SearchHistory objects
    if (!searchHistory || !Array.isArray(searchHistory) || searchHistory.length === 0) {
      return [];
    }

    // Check if searchHistory is an array of strings (current API format)
    if (typeof searchHistory[0] === 'string') {
      return (searchHistory as unknown as string[]).map((query: string, index) => ({
        id: `history_${index + 1}`,
        title: query,
        description: `Recent search`,
        icon: Clock,
      }));
    }

    // Handle SearchHistory object format (future API format)
    if (typeof searchHistory[0] === 'object' && searchHistory[0] !== null) {
      return searchHistory.map((historyItem: any) => ({
        id: historyItem.id,
        title: historyItem.query,
        description: `${historyItem.resultCount || 0} results • ${historyItem.timestamp ? new Date(historyItem.timestamp).toLocaleDateString() : 'Recent'}`,
        icon: Clock,
      }));
    }

    return [];
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
      setInputQuery(value); // Update input query state
      setSearchQuery(value); // Also update search hook
      onSearch(value);

      // Always open panel when user is interacting with search
      setIsOpen(true);

      if (value.trim()) {
        // Trigger search with debouncing handled by useSearch hook
        search(value);
      } else {
        // Clear results when input is empty, but keep panel open to show recent items
        clearResults();
      }
    },
    [onSearch, setSearchQuery, search, clearResults]
  );

  // Handle auto-complete suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setInputQuery(suggestion);
    setSearchQuery(suggestion);
    onSearch(suggestion);
    search(suggestion);
  }, [onSearch, setSearchQuery, search]);

  const handleOpenPanel = useCallback(() => {
    setIsOpen(true);
    // If there's no query, we want to show recent items, so don't trigger search
    // The SearchDropdown will handle showing recent items when searchQuery is empty
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);

    // Only trigger search if there's a query AND tab actually changed
    if (inputQuery.trim() && tabId !== activeTab) {
      // Clear previous results first
      clearResults();

      // Trigger new search with delay to prevent spam
      setTimeout(() => {
        search(inputQuery); // Use inputQuery instead of searchQuery
      }, 300);
    }
  }, [inputQuery, search, activeTab, clearResults]);

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
    setInputQuery(item.title); // Update input query
    setSearchQuery(item.title); // Also update search hook
    setIsOpen(true);
  }, [setSearchQuery]);

  const handleRetry = useCallback(async () => {
    await retry();
  }, [retry]);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
  }, [clearHistory]);

  const handleLoadMore = useCallback(async () => {
    const entityType = TAB_TO_ENTITY_MAP[activeTab];
    // Fix: Only call loadMore for specific entities, not for 'all' tab
    if (entityType !== 'all') {
      await loadMore(entityType as SearchEntity);
    }
  }, [loadMore, activeTab]);

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <SearchInput
        value={inputQuery} // Use inputQuery for display
        onChange={handleSearchChange}
        onFocus={handleOpenPanel}
        suggestions={suggestions} // Pass suggestions from useSearch hook
        onSuggestionSelect={handleSuggestionSelect}
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
        searchQuery={inputQuery} // Use inputQuery for dropdown
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
