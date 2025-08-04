/**
 * Calendar Service Layer - Handles all API interactions
 * Enterprise-grade with error handling, caching, and optimistic updates
 */

import { 
  CalendarEvent, 
  CalendarEventsResponse, 
  CreateEventRequest, 
  UpdateEventRequest,
  CalendarSearchParams,
  Team,
  Project,
  CalendarUser
} from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class CalendarServiceError extends Error {
  constructor(
    message: string, 
    public statusCode?: number, 
    public code?: string
  ) {
    super(message);
    this.name = 'CalendarServiceError';
  }
}

// HTTP Client with error handling
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new CalendarServiceError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error.code
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof CalendarServiceError) {
        throw error;
      }
      
      throw new CalendarServiceError(
        'Network error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Events Service
export const eventsService = {
  /**
   * Fetch events with pagination and filtering
   */
  async getEvents(params: CalendarSearchParams): Promise<CalendarEventsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.query) {
      searchParams.append('q', params.query);
    }
    
    if (params.dateRange) {
      searchParams.append('start', params.dateRange.start.toISOString());
      searchParams.append('end', params.dateRange.end.toISOString());
    }
    
    if (params.filters.length > 0) {
      searchParams.append('filters', JSON.stringify(params.filters));
    }
    
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
      searchParams.append('sortOrder', params.sortOrder || 'asc');
    }

    return apiClient.get<CalendarEventsResponse>(
      `/calendar/events?${searchParams.toString()}`
    );
  },

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(start: Date, end: Date): Promise<CalendarEvent[]> {
    const response = await this.getEvents({
      dateRange: { start, end },
      filters: [],
    });
    return response.events;
  },

  /**
   * Get single event by ID
   */
  async getEvent(id: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`/calendar/events/${id}`);
  },

  /**
   * Create new event
   */
  async createEvent(data: CreateEventRequest): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>('/calendar/events', {
      ...data,
      start: data.start.toISOString(),
      end: data.end?.toISOString(),
    });
  },

  /**
   * Update existing event
   */
  async updateEvent(data: UpdateEventRequest): Promise<CalendarEvent> {
    const { id, ...updateData } = data;
    return apiClient.put<CalendarEvent>(`/calendar/events/${id}`, {
      ...updateData,
      start: updateData.start?.toISOString(),
      end: updateData.end?.toISOString(),
    });
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete<void>(`/calendar/events/${id}`);
  },

  /**
   * Bulk operations
   */
  async bulkUpdateEvents(updates: UpdateEventRequest[]): Promise<CalendarEvent[]> {
    return apiClient.post<CalendarEvent[]>('/calendar/events/bulk', updates);
  },

  async bulkDeleteEvents(ids: string[]): Promise<void> {
    return apiClient.post<void>('/calendar/events/bulk-delete', { ids });
  },
};

// Teams Service
export const teamsService = {
  /**
   * Get user's teams
   */
  async getTeams(): Promise<Team[]> {
    return apiClient.get<Team[]>('/teams');
  },

  /**
   * Get team by ID
   */
  async getTeam(id: string): Promise<Team> {
    return apiClient.get<Team>(`/teams/${id}`);
  },

  /**
   * Get team events
   */
  async getTeamEvents(teamId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const searchParams = new URLSearchParams({
      teamId,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const response = await apiClient.get<CalendarEventsResponse>(
      `/calendar/events?${searchParams.toString()}`
    );
    return response.events;
  },
};

// Projects Service  
export const projectsService = {
  /**
   * Get user's projects
   */
  async getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  /**
   * Get project events
   */
  async getProjectEvents(projectId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const searchParams = new URLSearchParams({
      projectId,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const response = await apiClient.get<CalendarEventsResponse>(
      `/calendar/events?${searchParams.toString()}`
    );
    return response.events;
  },
};

// Users Service
export const usersService = {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<CalendarUser> {
    return apiClient.get<CalendarUser>('/auth/me');
  },

  /**
   * Get users for assignment
   */
  async getUsers(query?: string): Promise<CalendarUser[]> {
    const searchParams = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiClient.get<CalendarUser[]>(`/users${searchParams}`);
  },

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<CalendarUser[]> {
    return apiClient.get<CalendarUser[]>(`/teams/${teamId}/members`);
  },
};

// Calendar Service - Main service class
export class CalendarService {
  // Cache for frequently accessed data
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  private getCacheKey(key: string, params?: any): string {
    return params ? `${key}:${JSON.stringify(params)}` : key;
  }

  private setCache(key: string, data: any, ttl = 5 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  /**
   * Get events with caching
   */
  async getEvents(params: CalendarSearchParams, useCache = true): Promise<CalendarEventsResponse> {
    const cacheKey = this.getCacheKey('events', params);
    
    if (useCache) {
      const cached = this.getCache<CalendarEventsResponse>(cacheKey);
      if (cached) return cached;
    }

    const result = await eventsService.getEvents(params);
    
    // Transform date strings back to Date objects
    result.events = result.events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : undefined,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Create event with optimistic updates
   */
  async createEvent(data: CreateEventRequest): Promise<CalendarEvent> {
    const result = await eventsService.createEvent(data);
    
    // Clear related caches
    this.clearEventCaches();
    
    return {
      ...result,
      start: new Date(result.start),
      end: result.end ? new Date(result.end) : undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  /**
   * Update event with optimistic updates
   */
  async updateEvent(data: UpdateEventRequest): Promise<CalendarEvent> {
    const result = await eventsService.updateEvent(data);
    
    // Clear related caches
    this.clearEventCaches();
    
    return {
      ...result,
      start: new Date(result.start),
      end: result.end ? new Date(result.end) : undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await eventsService.deleteEvent(id);
    this.clearEventCaches();
  }

  private clearEventCaches(): void {
    // Clear all event-related caches
    Array.from(this.cache.keys())
      .filter(key => key.startsWith('events:'))
      .forEach(key => this.cache.delete(key));
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

// Export individual services
export { eventsService, teamsService, projectsService, usersService };
export { CalendarServiceError };