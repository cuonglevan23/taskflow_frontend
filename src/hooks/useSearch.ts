import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SearchQuery,
  SearchResponse,
  SearchEntity,
  SearchFilters,
  SearchHistory,
  SmartSuggestion,
  SmartSuggestionsResponse
} from '@/types/search';
import SearchService from '@/services/searchService';

interface UseSearchOptions {
  entities?: SearchEntity[];
  filters?: SearchFilters;
  autoSearch?: boolean;
  debounceMs?: number;
  defaultScope?: 'my' | 'team' | 'organization' | 'all';
  enableHistory?: boolean;
  enableSuggestions?: boolean;
  pageSize?: number;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResponse['data'] | null;
  loading: boolean;
  error: string | null;
  suggestions: string[];
  searchHistory: SearchHistory[];
  smartSuggestions: Array<{ id: string; type: string; text: string }>;
  search: (customQuery?: string, customFilters?: SearchFilters) => Promise<void>;
  quickSearch: (query: string) => Promise<void>;
  advancedSearch: (filters: Record<string, any>, sorting?: any) => Promise<void>;
  searchWithPagination: (page: number) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => Promise<void>;
  removeFromHistory: (historyId: string) => Promise<void>;
  loadMore: (entity: SearchEntity) => Promise<void>;
  retry: () => Promise<void>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    entities = ['tasks', 'projects', 'users', 'teams'],
    filters = {},
    autoSearch = false,
    debounceMs = 300,
    defaultScope = 'all',
    enableHistory = true,
    enableSuggestions = true,
    pageSize = 20
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{ id: string; type: string; text: string }>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastSearchQueryRef = useRef<SearchQuery | null>(null);
  const lastQueryRef = useRef<string>(''); // Add ref to track last query
  const lastAutocompletQueryRef = useRef<string>(''); // Add ref for autocomplete
  const lastSmartSuggestionsQueryRef = useRef<string>(''); // Add ref for smart suggestions
  const isInitialMount = useRef(true); // Track initial mount

  // Load search history on mount ONLY ONCE
  useEffect(() => {
    if (enableHistory && isInitialMount.current) {
      loadSearchHistory();
      isInitialMount.current = false;
    }
  }, []); // Remove enableHistory dependency

  const loadSearchHistory = async () => {
    try {
      const history = await SearchService.getSearchHistory(10);
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  // Enhanced debounced search with suggestions - PREVENT INFINITE LOOPS
  const debouncedSearch = useCallback(
    async (searchQuery: string, customFilters: SearchFilters = {}) => {
      // CRITICAL: Prevent infinite loops
      if (lastQueryRef.current === searchQuery && !Object.keys(customFilters).length) {
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        if (searchQuery.trim() || Object.keys(customFilters).length > 0) {
          const previousQuery = lastQueryRef.current; // Store previous query before updating
          lastQueryRef.current = searchQuery; // Update last query ref
          await performSearch(searchQuery, customFilters);

          // Get suggestions in parallel if enabled - ONLY if query changed
          if (enableSuggestions && searchQuery.trim() && searchQuery !== previousQuery) {
            await Promise.all([
              getAutocompleteSuggestions(searchQuery),
              getSmartSuggestions(searchQuery)
            ]);
          }
        } else {
          setResults(null);
          setSuggestions([]);
          setSmartSuggestions([]);
          lastQueryRef.current = '';
        }
      }, debounceMs);
    },
    [debounceMs, entities, filters, enableSuggestions] // Remove dependencies that cause loops
  );

  // Enhanced main search function with retry logic and global search support
  const performSearch = async (
    searchQuery: string,
    customFilters: SearchFilters = {},
    page: number = 0,
    retryAttempt: number = 0
  ) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      let searchResponse: SearchResponse | any;

      // Check if this is a global search (all entities)
      const isGlobalSearch = entities.length > 1 ||
        (entities.length === 1 && entities.includes('tasks') && entities.includes('projects') &&
         entities.includes('users') && entities.includes('teams'));

      if (isGlobalSearch || (entities.length === 4 &&
          entities.includes('tasks') && entities.includes('projects') &&
          entities.includes('users') && entities.includes('teams'))) {
        // Use global search endpoint
        const globalResult = await SearchService.globalSearch(searchQuery, page, pageSize);

        // Transform global search result to match SearchResponse format
        searchResponse = {
          success: globalResult.success,
          data: globalResult.data, // Already in correct format from backend
          meta: {
            query: globalResult.query,
            totalResults: globalResult.totalResults,
            searchTime: '0ms', // Global search doesn't return timing
            suggestions: []
          }
        };
      } else {
        // Use regular search for single entity
        const searchRequest: SearchQuery = {
          query: searchQuery,
          entities,
          filters: { ...filters, ...customFilters },
          pagination: { page, size: pageSize },
          sorting: { field: 'relevance', direction: 'desc' },
          context: {
            userId: 1, // Will be populated by SearchService
            includePrivate: false,
            scope: defaultScope,
            organizationId: 1,
            userTeamIds: [],
            userProjectIds: []
          }
        };

        searchResponse = await SearchService.search(searchRequest);
      }

      // Save search to history if enabled and successful
      if (enableHistory && searchResponse.success && searchQuery.trim()) {
        await SearchService.saveSearchToHistory(
          {
            query: searchQuery,
            entities,
            filters: { ...filters, ...customFilters },
            pagination: { page, size: pageSize },
            sorting: { field: 'relevance', direction: 'desc' },
            context: {
              userId: 1,
              includePrivate: false,
              scope: defaultScope,
              organizationId: 1,
              userTeamIds: [],
              userProjectIds: []
            }
          },
          searchResponse.meta?.totalResults || 0
        );

        // Reload history to show latest search
        await loadSearchHistory();
      }

      setResults(searchResponse.data);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Search failed:', err);

      // Implement exponential backoff retry
      if (retryAttempt < 2) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          performSearch(searchQuery, customFilters, page, retryAttempt + 1);
        }, delay);
        return;
      }

      setError(err.message || 'Search failed');
      setRetryCount(retryAttempt + 1);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced quick search
  const quickSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.quickSearch(
        searchQuery,
        getCurrentUserId(),
        defaultScope
      );

      if (response.success) {
        setResults(response.data);
      }
    } catch (error: any) {
      setError(error.message || 'Quick search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Advanced search with complex filters
  const advancedSearch = async (
    customFilters: Record<string, any>,
    sorting?: { field: string; direction: 'asc' | 'desc' }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.advancedSearch(
        query,
        entities,
        customFilters,
        sorting,
        { page: 0, size: pageSize }
      );

      if (response.success) {
        setResults(response.data);
        setCurrentPage(0);
      }
    } catch (error: any) {
      setError(error.message || 'Advanced search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination support
  const searchWithPagination = async (page: number) => {
    if (lastSearchQueryRef.current) {
      await performSearch(
        lastSearchQueryRef.current.query,
        lastSearchQueryRef.current.filters,
        page
      );
    }
  };

  // Load more for specific entity
  const loadMore = async (entity: SearchEntity) => {
    if (lastSearchQueryRef.current && results?.[entity]?.hasNext) {
      await searchWithPagination(currentPage + 1);
    }
  };

  // Get autocomplete suggestions with caching - PREVENT SPAM
  const getAutocompleteSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      // PREVENT DUPLICATE CALLS using separate ref
      if (lastAutocompletQueryRef.current === searchQuery) {
        return;
      }

      try {
        lastAutocompletQueryRef.current = searchQuery; // Update ref BEFORE API call

        // Try different entities if the first one doesn't return suggestions
        let response;
        for (const entity of entities) {
          response = await SearchService.getAutocompleteSuggestions(searchQuery, entity);

          // If we got suggestions, use them
          if (response.suggestions && response.suggestions.length > 0) {
            setSuggestions(response.suggestions);
            return;
          }
        }

        // If no entity returned suggestions, try some fallback suggestions based on search history
        const fallbackSuggestions = searchHistory
          .filter(historyItem => {
            const historyQuery = typeof historyItem === 'string' ? historyItem : historyItem.query;
            return historyQuery && historyQuery.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .slice(0, 3)
          .map(historyItem => typeof historyItem === 'string' ? historyItem : historyItem.query);

        if (fallbackSuggestions.length > 0) {
          setSuggestions(fallbackSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      }
    },
    [entities, searchHistory] // Add searchHistory to dependencies
  );

  // Get smart AI suggestions - PREVENT SPAM
  const getSmartSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setSmartSuggestions([]);
        return;
      }

      // PREVENT DUPLICATE CALLS using separate ref
      if (lastSmartSuggestionsQueryRef.current === searchQuery) {
        return;
      }

      try {
        lastSmartSuggestionsQueryRef.current = searchQuery; // Update ref BEFORE API call
        const userContext = {
          recentTasks: [],
          currentProjects: [],
          teamMembers: []
        };

        const response = await SearchService.getSmartSuggestions(searchQuery, userContext);
        setSmartSuggestions(response.suggestions);
      } catch (error) {
        console.warn('❌ Smart suggestions error:', error);
        setSmartSuggestions([]);
      }
    },
    [] // No dependencies to prevent loops
  );

  // Auto search when query changes - CONTROLLED TRIGGERING
  useEffect(() => {
    if (autoSearch && query !== lastQueryRef.current) {
      debouncedSearch(query);
    }
  }, [query, autoSearch]); // Remove debouncedSearch dependency

  // Manual search function
  const search = async (customQuery?: string, customFilters?: SearchFilters) => {
    const searchQuery = customQuery !== undefined ? customQuery : query;
    await performSearch(searchQuery, customFilters);
  };

  // Retry last search
  const retry = async () => {
    if (lastSearchQueryRef.current) {
      await performSearch(
        lastSearchQueryRef.current.query,
        lastSearchQueryRef.current.filters,
        0,
        retryCount
      );
    }
  };

  // Clear results
  const clearResults = () => {
    setResults(null);
    setError(null);
    setSuggestions([]);
    setSmartSuggestions([]);
    setQuery('');
    setCurrentPage(0);
    lastSearchQueryRef.current = null;
  };

  // Clear search history
  const clearHistory = async () => {
    try {
      await SearchService.clearSearchHistory();
      setSearchHistory([]);
    } catch (error: any) {
      setError(error.message || 'Failed to clear history.');
    }
  };

  // Remove specific item from history
  const removeFromHistory = async (historyId: string) => {
    try {
      await SearchService.removeSearchFromHistory(historyId);
      await loadSearchHistory(); // Refresh history
    } catch (error: any) {
      setError(error.message || 'Failed to remove from history.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
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
    searchWithPagination,
    clearResults,
    clearHistory,
    removeFromHistory,
    loadMore,
    retry
  };
};

// Context-aware search hook
export const useContextualSearch = (
  context: 'my' | 'team' | 'organization' | 'all' = 'all'
) => {
  return useSearch({
    defaultScope: context,
    autoSearch: true,
    entities: ['tasks', 'projects', 'users', 'teams'],
    enableHistory: true,
    enableSuggestions: true
  });
};

// Entity-specific search hooks
export const useTaskSearch = (filters?: SearchFilters['tasks']) => {
  return useSearch({
    entities: ['tasks'],
    filters: { tasks: filters },
    autoSearch: true,
    enableSuggestions: true
  });
};

export const useProjectSearch = (filters?: SearchFilters['projects']) => {
  return useSearch({
    entities: ['projects'],
    filters: { projects: filters },
    autoSearch: true,
    enableSuggestions: true
  });
};

export const useUserSearch = (filters?: SearchFilters['users']) => {
  return useSearch({
    entities: ['users'],
    filters: { users: filters },
    autoSearch: true,
    enableSuggestions: true
  });
};

export const useTeamSearch = (filters?: SearchFilters['teams']) => {
  return useSearch({
    entities: ['teams'],
    filters: { teams: filters },
    autoSearch: true,
    enableSuggestions: true
  });
};

// Enhanced hook for real-time search with suggestions
export const useRealTimeSearch = (entity: SearchEntity = 'tasks') => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const searchWithSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults(null);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await SearchService.searchWithSuggestions(searchQuery, entity);
        setResults(response.results);
        setSuggestions(response.suggestions.suggestions);
      } catch (error: any) {
        console.error('Real-time search error:', error);
      } finally {
        setLoading(false);
      }
    },
    [entity]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        searchWithSuggestions(query);
      }
    }, 200);

    return () => clearTimeout(debounce);
  }, [query, searchWithSuggestions]);

  return {
    query,
    setQuery,
    results: results?.data || null,
    suggestions,
    loading
  };
};

// Utility function to get current user ID
function getCurrentUserId(): number {
  if (typeof window !== 'undefined') {
    try {
      // Try different auth sources
      const user = localStorage.getItem('currentUser');
      if (user) {
        return JSON.parse(user).id;
      }

      // NextAuth fallback
      const session = localStorage.getItem('nextauth.session');
      if (session) {
        return JSON.parse(session)?.user?.id || 1;
      }
    } catch (error) {
      console.warn('Failed to get user ID:', error);
    }
  }
  return 1;
}
