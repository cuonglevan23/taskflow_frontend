import { useState, useCallback } from 'react';
import ProjectTaskGoogleCalendarService, {
  CreateCalendarEventRequest,
  CalendarEventResponse,
  QuickMeetingOptions,
  CalendarEventInfo
} from '@/services/tasks/projectTaskGoogleCalendarService';

export const useProjectTaskGoogleCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createCalendarEvent = useCallback(async (
    taskId: number,
    eventData: CreateCalendarEventRequest
  ): Promise<CalendarEventResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ProjectTaskGoogleCalendarService.createCalendarEvent(taskId, eventData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createQuickMeeting = useCallback(async (
    taskId: number,
    options: QuickMeetingOptions = {}
  ): Promise<CalendarEventResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ProjectTaskGoogleCalendarService.createQuickMeeting(taskId, options);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCalendarEvent = useCallback(async (
    taskId: number,
    eventData: CreateCalendarEventRequest
  ): Promise<CalendarEventResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ProjectTaskGoogleCalendarService.updateCalendarEvent(taskId, eventData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCalendarEvent = useCallback(async (taskId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ProjectTaskGoogleCalendarService.deleteCalendarEvent(taskId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCalendarEvent = useCallback(async (taskId: number): Promise<CalendarEventInfo> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ProjectTaskGoogleCalendarService.getCalendarEvent(taskId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    createCalendarEvent,
    createQuickMeeting,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEvent,
  };
};

// Re-export types for convenience
export type {
  CreateCalendarEventRequest,
  CalendarEventResponse,
  QuickMeetingOptions,
  CalendarEventInfo
} from '@/services/tasks/projectTaskGoogleCalendarService';
