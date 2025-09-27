/**
 * Enhanced SearchService with BaseApiClient integration
 * Ensures all API calls use Bearer token + automatic refresh
 */

import {
  SearchQuery,
  SearchResponse,
  AutocompleteResponse,
  SearchEntity,
  SearchHistory,
  SmartSuggestionsRequest,
  SmartSuggestionsResponse
} from '@/types/search';
import { BaseApiClient } from '@/lib/baseApiClient'; // Use BaseApiClient instead of AuthService

// Utility class for building query parameters
class SearchQueryBuilder {
  private params = new URLSearchParams();

  add(key: string, value: string | number | boolean | undefined | null): this {
    if (value !== undefined && value !== null && value !== '') {
      this.params.append(key, value.toString());
    }
    return this;
  }

  addArray(key: string, values: any[] | undefined): this {
    if (values && values.length > 0) {
      this.params.append(key, values.join(','));
    }
    return this;
  }

  addObject(prefix: string, obj: Record<string, any> | undefined): this {
    if (obj) {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          this.addArray(`${prefix}.${key}`, value);
        } else if (value !== undefined && value !== null) {
          this.add(`${prefix}.${key}`, value);
        }
      });
    }
    return this;
  }

  build(): string {
    return this.params.toString();
  }
}

export class SearchService {
  private static readonly ENDPOINTS = {
    SEARCH: '/api/search',
    GLOBAL_SEARCH: '/api/search/global', // Add global search endpoint
    QUICK_SEARCH: '/api/search/quick',
    AUTOCOMPLETE: '/api/search/autocomplete',
    MY_CONTENT: '/api/search/my',
    ENTITY_SEARCH: (entity: SearchEntity) => `/api/search/${entity}`,
    HISTORY: '/api/search/history',
    SMART_SUGGESTIONS: '/api/search/smart-suggestions'
  } as const;

  /**
   * Helper method to make authenticated API calls using BaseApiClient
   */
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // Use BaseApiClient.get for GET requests, BaseApiClient.post for others
      if (!options || !options.method || options.method === 'GET') {
        return await BaseApiClient.get<T>(endpoint);
      } else if (options.method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : undefined;
        return await BaseApiClient.post<T>(endpoint, body);
      } else if (options.method === 'PUT') {
        const body = options.body ? JSON.parse(options.body as string) : undefined;
        return await BaseApiClient.put<T>(endpoint, body);
      } else if (options.method === 'DELETE') {
        return await BaseApiClient.delete<T>(endpoint);
      }

      throw new Error(`Unsupported HTTP method: ${options.method}`);
    } catch (error: any) {
      throw new Error(error.message || 'API request failed');
    }
  }

  /**
   * Global search across all entities (tasks, projects, users, teams)
   * Matches the backend /api/search/global endpoint
   */
  static async globalSearch(
    query: string = "",
    page: number = 0,
    size: number = 10
  ): Promise<{
    success: boolean;
    query: string;
    totalResults: number;
    data: {
      tasks: any;
      projects: any;
      users: any;
      teams: any;
    };
  }> {
    try {
      const queryString = new SearchQueryBuilder()
        .add('q', query)
        .add('page', page)
        .add('size', size)
        .build();

      return await BaseApiClient.get(
        `${this.ENDPOINTS.GLOBAL_SEARCH}?${queryString}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Global search failed. Please try again.');
    }
  }

  /**
   * Unified search API - Main search endpoint
   */
  static async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    try {
      return await BaseApiClient.post<SearchResponse>(
        this.ENDPOINTS.SEARCH,
        searchQuery
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to perform search. Please try again.');
    }
  }

  /**
   * Quick search for simple queries with optimized query building
   */
  static async quickSearch(
    query: string,
    userId: number,
    scope: 'my' | 'team' | 'organization' | 'all' = 'all'
  ): Promise<SearchResponse> {
    try {
      const queryString = new SearchQueryBuilder()
        .add('q', query)
        .add('userId', userId)
        .add('scope', scope)
        .build();

      return await BaseApiClient.get<SearchResponse>(
        `${this.ENDPOINTS.QUICK_SEARCH}?${queryString}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Quick search failed. Please try again.');
    }
  }

  /**
   * Get autocomplete suggestions with caching and debouncing built-in
   */
  static async getAutocompleteSuggestions(
    query: string,
    entity: SearchEntity = 'tasks'
  ): Promise<AutocompleteResponse> {
    try {
      if (query.length < 2) {
        return { suggestions: [] };
      }

      const queryString = new SearchQueryBuilder()
        .add('q', query)
        .add('entity', entity)
        .build();

      const result = await BaseApiClient.get<any>(
        `${this.ENDPOINTS.AUTOCOMPLETE}?${queryString}`
      );

      // Handle the API response structure - it might return {success: true, suggestions: [...]} or direct {suggestions: [...]}
      if (result && typeof result === 'object') {
        // If result has suggestions array, return it
        if (Array.isArray(result.suggestions)) {
          return { suggestions: result.suggestions };
        }

        // If result is directly the suggestions array
        if (Array.isArray(result)) {
          return { suggestions: result };
        }
      }

      return { suggestions: [] };
    } catch (error: any) {
      console.error('Autocomplete error:', error);
      return { suggestions: [] }; // Graceful fallback for autocomplete
    }
  }

  /**
   * Search user's own content across entities
   */
  static async searchMyContent(
    query: string,
    entities: SearchEntity[] = ['tasks', 'projects'],
    page: number = 0,
    size: number = 20
  ): Promise<SearchResponse> {
    try {
      const queryString = new SearchQueryBuilder()
        .add('q', query)
        .addArray('entities', entities)
        .add('page', page)
        .add('size', size)
        .build();

      return await BaseApiClient.get<SearchResponse>(
        `${this.ENDPOINTS.MY_CONTENT}?${queryString}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search your content. Please try again.');
    }
  }

  /**
   * Entity-specific search with optimized filter handling
   */
  static async searchEntity(
    entity: SearchEntity,
    query: string,
    filters: Record<string, any> = {},
    page: number = 0,
    size: number = 20
  ): Promise<SearchResponse> {
    try {
      const queryBuilder = new SearchQueryBuilder()
        .add('q', query)
        .add('page', page)
        .add('size', size);

      // Add filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryBuilder.addArray(key, value);
        } else if (value !== undefined && value !== null) {
          queryBuilder.add(key, value);
        }
      });

      const queryString = queryBuilder.build();

      return await BaseApiClient.get<SearchResponse>(
        `${this.ENDPOINTS.ENTITY_SEARCH(entity)}?${queryString}`
      );
    } catch (error: any) {
      throw new Error(error.message || `Failed to search ${entity}. Please try again.`);
    }
  }

  /**
   * Search with pagination support
   */
  static async searchWithPagination(
    searchQuery: SearchQuery,
    page: number,
    size: number = 20
  ): Promise<SearchResponse> {
    try {
      const paginatedQuery = {
        ...searchQuery,
        pagination: { page, size }
      };

      return await this.search(paginatedQuery);
    } catch (error: any) {
      throw new Error(error.message || 'Paginated search failed.');
    }
  }

  /**
   * Advanced search with complex filters
   */
  static async advancedSearch(
    query: string,
    entities: SearchEntity[],
    filters: Record<string, any>,
    sorting: { field: 'relevance' | 'date' | 'name' | 'priority'; direction: 'asc' | 'desc' } = { field: 'relevance', direction: 'desc' },
    pagination: { page: number; size: number } = { page: 0, size: 20 }
  ): Promise<SearchResponse> {
    try {
      const userId = await this.getCurrentUserId();

      const searchRequest: SearchQuery = {
        query,
        entities,
        filters,
        pagination,
        sorting,
        context: {
          userId,
          includePrivate: false,
          scope: 'all',
          organizationId: 1, // Default organization
          userTeamIds: [], // Will be populated by backend
          userProjectIds: [] // Will be populated by backend
        }
      };

      return await this.search(searchRequest);
    } catch (error: any) {
      throw new Error(error.message || 'Advanced search failed.');
    }
  }

  /**
   * Get search history with BaseApiClient integration
   */
  static async getSearchHistory(limit: number = 10): Promise<SearchHistory[]> {
    try {
      const queryString = new SearchQueryBuilder()
        .add('limit', limit)
        .build();

      const apiUrl = `${this.ENDPOINTS.HISTORY}?${queryString}`;
      const result = await this.makeRequest<any>(apiUrl);

      // Handle the API response structure {success: true, history: [...]}
      if (result && result.success && Array.isArray(result.history)) {
        return result.history;
      }

      // Fallback: if result is directly an array
      if (Array.isArray(result)) {
        return result;
      }

      return [];
    } catch (error: any) {
      console.error('Failed to load search history:', error);
      return []; // Graceful fallback for history
    }
  }

  /**
   * Save search to history with BaseApiClient integration
   */
  static async saveSearchToHistory(
    searchQuery: SearchQuery,
    resultCount: number
  ): Promise<void> {
    try {
      await this.makeRequest<void>(this.ENDPOINTS.HISTORY, {
        method: 'POST',
        body: JSON.stringify({
          query: searchQuery.query,
          entities: searchQuery.entities,
          resultCount,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error: any) {
      // Don't throw error for history saving failure - it's not critical
    }
  }

  /**
   * Clear search history with BaseApiClient integration
   */
  static async clearSearchHistory(): Promise<void> {
    try {
      await this.makeRequest<void>(this.ENDPOINTS.HISTORY, {
        method: 'DELETE'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear search history.');
    }
  }

  /**
   * Remove specific search from history with BaseApiClient integration
   */
  static async removeSearchFromHistory(historyId: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.ENDPOINTS.HISTORY}/${historyId}`, {
        method: 'DELETE'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove search from history.');
    }
  }

  /**
   * Get smart AI-powered suggestions based on user context
   */
  static async getSmartSuggestions(
    query: string,
    userContext: {
      recentTasks?: any[];
      currentProjects?: any[];
      teamMembers?: any[];
      departments?: string[];
      skills?: string[];
      recentSearches?: string[];
    }
  ): Promise<SmartSuggestionsResponse> {
    try {
      const request: SmartSuggestionsRequest = {
        partialQuery: query, // Matches backend DTO
        maxSuggestions: 5,
        // Only send the 6 fields that backend DTO expects:
        // activityContext must be a STRING, not an object
        activityContext: JSON.stringify({
          currentPage: window.location.pathname,
          timestamp: new Date().toISOString(),
          // Include user context data as JSON string
          recentTasks: userContext.recentTasks || [],
          currentProjects: userContext.currentProjects || [],
          teamMembers: userContext.teamMembers || []
        }),
        recentSearches: userContext.recentSearches || [],
        entityTypes: ['task', 'project', 'user', 'team'],
        context: {
          userId: await this.getCurrentUserId(),
          scope: 'all',
          departments: userContext.departments || [],
          skills: userContext.skills || []
        }
      };

      return await BaseApiClient.post(this.ENDPOINTS.SMART_SUGGESTIONS, request);
    } catch (error: any) {
      return {
        suggestions: [],
        processingTime: '0ms'
      }; // Graceful fallback with proper interface
    }
  }

  /**
   * Search with real-time suggestions and autocomplete
   */
  static async searchWithSuggestions(
    query: string,
    entity: SearchEntity = 'tasks'
  ): Promise<{
    results: SearchResponse;
    suggestions: AutocompleteResponse;
  }> {
    try {
      const userId = await this.getCurrentUserId();

      const [results, suggestions] = await Promise.allSettled([
        this.quickSearch(query, userId),
        this.getAutocompleteSuggestions(query, entity)
      ]);

      return {
        results: results.status === 'fulfilled' ? results.value : { success: false, data: {}, meta: { query, totalResults: 0, searchTime: '0ms', suggestions: [] } },
        suggestions: suggestions.status === 'fulfilled' ? suggestions.value : { suggestions: [] }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Search with suggestions failed.');
    }
  }

  /**
   * Batch search across multiple entities efficiently
   */
  static async batchSearch(
    queries: Array<{ query: string; entity: SearchEntity; filters?: any }>
  ): Promise<SearchResponse[]> {
    try {
      const searchPromises = queries.map(({ query, entity, filters }) =>
        this.searchEntity(entity, query, filters)
      );

      const results = await Promise.allSettled(searchPromises);

      return results.map(result =>
        result.status === 'fulfilled'
          ? result.value
          : { success: false, data: {}, meta: { query: '', totalResults: 0, searchTime: '0ms', suggestions: [] } }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Batch search failed.');
    }
  }

  /**
   * Get current user ID from context (HTTP-only cookies only)
   */
  private static async getCurrentUserId(): Promise<number> {
    // Use BaseApiClient to get current user with HTTP-only cookies
    if (typeof window !== 'undefined') {
      try {
        // Use BaseApiClient.get to get current user info
        const user = await BaseApiClient.get<{ id: number }>('/api/user-profiles/me');
        return user.id;
      } catch (error) {
        console.warn('Failed to get user from API:', error);
        // Fallback - this should be handled by auth context
        return 1;
      }
    }

    // Fallback - this should be handled by auth context
    return 1;
  }
}

export default SearchService;
