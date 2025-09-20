/**
 * Project Task Google Calendar Service
 * Handles all Google Calendar integration API calls for project tasks
 */

import { BaseApiClient } from '@/lib/baseApiClient';

// Types and Interfaces
export interface CreateCalendarEventRequest {
  taskId?: number;
  customTitle?: string;
  customDescription?: string;
  customStartTime?: string;
  customEndTime?: string;
  durationMinutes?: number;
  attendeeEmails?: string[];
  createMeet?: boolean;
}

export interface CalendarEventResponse {
  eventId: string | null;
  eventUrl: string | null;
  meetLink: string | null;
  title: string | null;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  message: string | null;
  success: boolean | null;
}

export interface QuickMeetingOptions {
  title?: string;
  description?: string;
  startTime?: string;
  durationMinutes?: number;
  attendeeEmails?: string[];
}

export interface CalendarEventInfo {
  taskId: number;
  hasCalendarEvent: boolean;
  eventId?: string;
  googleMeetLink?: string;
  googleCalendarEventUrl?: string;
  isSyncedToCalendar?: boolean;
  calendarSyncedAt?: string;
}

/**
 * Project Task Google Calendar Service
 */
export class ProjectTaskGoogleCalendarService {

  /**
   * Create a Google Calendar event for a project task
   */
  static async createCalendarEvent(
    taskId: number,
    eventData: CreateCalendarEventRequest
  ): Promise<CalendarEventResponse> {
    return BaseApiClient.post<CalendarEventResponse>(
      `/api/project-tasks/${taskId}/calendar-event`,
      {
        ...eventData,
        taskId,
      }
    );
  }

  /**
   * Create a quick meeting for a project task
   */
  static async createQuickMeeting(
    taskId: number,
    options: QuickMeetingOptions = {}
  ): Promise<CalendarEventResponse> {
    // Build query parameters
    const params = new URLSearchParams();
    if (options.title) params.append('title', options.title);
    if (options.description) params.append('description', options.description);
    if (options.startTime) params.append('startTime', options.startTime);
    if (options.durationMinutes) params.append('durationMinutes', options.durationMinutes.toString());
    if (options.attendeeEmails && options.attendeeEmails.length > 0) {
      options.attendeeEmails.forEach(email => params.append('attendeeEmails', email));
    }

    const endpoint = `/api/project-tasks/${taskId}/quick-meeting${params.toString() ? `?${params.toString()}` : ''}`;
    return BaseApiClient.post<CalendarEventResponse>(endpoint);
  }

  /**
   * Update a Google Calendar event for a project task
   */
  static async updateCalendarEvent(
    taskId: number,
    eventData: CreateCalendarEventRequest
  ): Promise<CalendarEventResponse> {
    return BaseApiClient.put<CalendarEventResponse>(
      `/api/project-tasks/${taskId}/calendar-event`,
      {
        ...eventData,
        taskId,
      }
    );
  }

  /**
   * Delete a Google Calendar event for a project task
   */
  static async deleteCalendarEvent(taskId: number): Promise<boolean> {
    const result = await BaseApiClient.delete<{ success: boolean; message?: string }>(
      `/api/project-tasks/${taskId}/calendar-event`
    );
    return result.success || false;
  }

  /**
   * Get calendar event information for a project task
   */
  static async getCalendarEvent(taskId: number): Promise<CalendarEventInfo> {
    return BaseApiClient.get<CalendarEventInfo>(
      `/api/project-tasks/${taskId}/calendar-event`
    );
  }
}

// Export types for external use
export type {
  CreateCalendarEventRequest as ProjectTaskCreateCalendarEventRequest,
  CalendarEventResponse as ProjectTaskCalendarEventResponse,
  QuickMeetingOptions as ProjectTaskQuickMeetingOptions,
  CalendarEventInfo as ProjectTaskCalendarEventInfo,
};

// Default export
export default ProjectTaskGoogleCalendarService;
