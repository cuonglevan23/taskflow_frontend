import { useState, useCallback } from 'react';
import {
  GoogleCalendarService,
  CalendarEventRequest,
  CalendarEventResponse,
  QuickMeetingParams,
  QuickMeetingResponse,
  DeleteEventResponse,
  createDefaultCalendarEvent,
  createDefaultQuickMeeting
} from '@/services/googleCalendarService';

export interface UseGoogleCalendarReturn {
  // States
  isLoading: boolean;
  error: string | null;
  lastCreatedEvent: CalendarEventResponse | null;
  lastQuickMeeting: QuickMeetingResponse | null;

  // Actions - Updated để không cần accessToken
  createCalendarEvent: (taskId: number | string, calendarData: CalendarEventRequest) => Promise<CalendarEventResponse | null>;
  createQuickMeeting: (taskId: number | string, meetingParams?: QuickMeetingParams) => Promise<QuickMeetingResponse | null>;
  deleteCalendarEvent: (taskId: number | string, eventId: string) => Promise<boolean>;
  scheduleReminder: (taskId: number | string, reminderTime: string, reminderMinutes?: number) => Promise<CalendarEventResponse | null>;
  getCalendarStatus: (taskId: number | string) => Promise<any>;

  // Helper actions - Updated để không cần accessToken
  createDefaultEvent: (taskId: number | string, title?: string) => Promise<CalendarEventResponse | null>;
  createDefaultMeeting: (taskId: number | string, title?: string, attendeeEmails?: string[]) => Promise<QuickMeetingResponse | null>;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook để quản lý Google Calendar Integration - Updated cho backend mới
 * Backend tự động lấy Google OAuth2 token từ user đã đăng nhập
 */
export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedEvent, setLastCreatedEvent] = useState<CalendarEventResponse | null>(null);
  const [lastQuickMeeting, setLastQuickMeeting] = useState<QuickMeetingResponse | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastCreatedEvent(null);
    setLastQuickMeeting(null);
  }, []);

  /**
   * Tạo sự kiện Calendar từ task - KHÔNG CẦN accessToken
   */
  const createCalendarEvent = useCallback(async (
    taskId: number | string,
    calendarData: CalendarEventRequest
  ): Promise<CalendarEventResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GoogleCalendarService.createCalendarEvent(taskId, calendarData);
      setLastCreatedEvent(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo sự kiện Calendar';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tạo cuộc họp nhanh - KHÔNG CẦN accessToken
   */
  const createQuickMeeting = useCallback(async (
    taskId: number | string,
    meetingParams: QuickMeetingParams = {}
  ): Promise<QuickMeetingResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GoogleCalendarService.createQuickMeeting(taskId, meetingParams);
      setLastQuickMeeting(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo cuộc họp nhanh';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Xóa sự kiện Calendar
   */
  const deleteCalendarEvent = useCallback(async (
    taskId: number | string,
    eventId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await GoogleCalendarService.deleteCalendarEvent(taskId, eventId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sự kiện Calendar';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lập lịch nhắc nhở
   */
  const scheduleReminder = useCallback(async (
    taskId: number | string,
    reminderTime: string,
    reminderMinutes: number = 30
  ): Promise<CalendarEventResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GoogleCalendarService.scheduleReminder(taskId, reminderTime, reminderMinutes);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lập lịch nhắc nhở';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Kiểm tra trạng thái Calendar
   */
  const getCalendarStatus = useCallback(async (taskId: number | string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GoogleCalendarService.getCalendarStatus(taskId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra trạng thái Calendar';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tạo sự kiện Calendar với cấu hình mặc định - KHÔNG CẦN accessToken
   */
  const createDefaultEvent = useCallback(async (
    taskId: number | string,
    title?: string
  ): Promise<CalendarEventResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createDefaultCalendarEvent(taskId, title);
      setLastCreatedEvent(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo sự kiện Calendar mặc định';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tạo cuộc họp nhanh với cấu hình mặc định - KHÔNG CẦN accessToken
   */
  const createDefaultMeeting = useCallback(async (
    taskId: number | string,
    title?: string,
    attendeeEmails?: string[]
  ): Promise<QuickMeetingResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createDefaultQuickMeeting(taskId, title, attendeeEmails);
      setLastQuickMeeting(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo cuộc họp nhanh mặc định';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // States
    isLoading,
    error,
    lastCreatedEvent,
    lastQuickMeeting,

    // Actions
    createCalendarEvent,
    createQuickMeeting,
    deleteCalendarEvent,
    scheduleReminder,
    getCalendarStatus,

    // Helper actions
    createDefaultEvent,
    createDefaultMeeting,

    // Utilities
    clearError,
    reset,
  };
};

export default useGoogleCalendar;
