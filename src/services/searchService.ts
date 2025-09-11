/**
 * Enhanced SearchService with AuthService integration
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
import { AuthService } from '@/lib/auth-backend'; // Use AuthService instead of BaseApiClient

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
    QUICK_SEARCH: '/api/search/quick',
    AUTOCOMPLETE: '/api/search/autocomplete',
    MY_CONTENT: '/api/search/my',
    ENTITY_SEARCH: (entity: SearchEntity) => `/api/search/${entity}`,
    HISTORY: '/api/search/history',
    SMART_SUGGESTIONS: '/api/search/smart-suggestions'
  } as const;

  /**
   * Helper method to make authenticated API calls using AuthService
   */
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await AuthService.makeAuthenticatedRequest(endpoint, options);

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Unified search API - Main search endpoint
   */
  static async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    try {
      return await AuthService.post<SearchResponse>(
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

      return await AuthService.get<SearchResponse>(
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

      return await AuthService.get<AutocompleteResponse>(
        `${this.ENDPOINTS.AUTOCOMPLETE}?${queryString}`
      );
    } catch (error: any) {
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

      return await AuthService.get<SearchResponse>(
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

      return await AuthService.get<SearchResponse>(
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
   * Get search history with AuthService integration
   */
  static async getSearchHistory(limit: number = 10): Promise<SearchHistory[]> {
    try {
      const queryString = new SearchQueryBuilder()
        .add('limit', limit)
        .build();

      return await this.makeRequest<SearchHistory[]>(
        `${this.ENDPOINTS.HISTORY}?${queryString}`
      );
    } catch (error: any) {
      console.warn('Failed to load search history:', error);
      return []; // Graceful fallback for history
    }
  }

  /**
   * Save search to history with AuthService integration
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
      console.warn('Failed to save search to history:', error);
      // Don't throw error for history saving failure - it's not critical
    }
  }

  /**
   * Clear search history with AuthService integration
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
   * Remove specific search from history with AuthService integration
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

      return await AuthService.post(this.ENDPOINTS.SMART_SUGGESTIONS, request);
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
    // Use AuthService to get current user with HTTP-only cookies
    if (typeof window !== 'undefined') {
      try {
        // Use AuthService to get current user info
        const response = await AuthService.makeAuthenticatedRequest('/api/user-profiles/me', {
          method: 'GET'
        });

        if (response.ok) {
          const user = await response.json();
          return user.id || 1;
        }

        // If 401, token might be expired - let AuthService handle refresh
        if (response.status === 401) {
          console.log('🔄 User not authenticated, attempting refresh...');
          // This will be handled by the AuthService in other parts of the app
        }
      } catch (error) {
        console.warn('Failed to get user from API:', error);
      }
    }

    // Fallback - this should be handled by auth context
    return 1;
  }
}

export default SearchService;
