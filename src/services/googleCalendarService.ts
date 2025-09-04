import api from './api';

// Types for Google Calendar Integration - Updated for new backend
export interface CalendarEventRequest {
  // accessToken không cần thiết nữa - backend tự lấy từ user đã đăng nhập
  customTitle?: string;
  customStartTime?: string;
  durationMinutes?: number;
  createMeet?: boolean;
  attendeeEmails?: string[];
  reminderMinutes?: number[];
  location?: string;
  eventColor?: string;
  allDay?: boolean;
  customEndTime?: string;
}

export interface CalendarEventResponse {
  eventId: string;
  eventUrl: string;
  meetLink?: string;
  title: string;
  startTime: string;
  endTime: string;
  attendeeCount?: number;
  hasMeet: boolean;
  hasReminders?: boolean;
  message: string;
}

export interface QuickMeetingParams {
  title?: string;
  description?: string;
  startTime?: string;
  durationMinutes?: number;
  attendeeEmails?: string;
}

export interface QuickMeetingResponse {
  eventId: string;
  eventUrl: string;
  meetLink: string;
  title: string;
  meetingType: string;
  attendeeCount: number;
  hasMeet: boolean;
  durationMinutes: number;
}

export interface DeleteEventResponse {
  message: string;
  eventId: string;
  taskId: string;
}

export interface UpdateCalendarEventRequest {
  // accessToken không cần thiết nữa
  customStartTime?: string;
  durationMinutes?: number;
  attendeeEmails?: string[];
  customTitle?: string;
  location?: string;
  eventColor?: string;
}

/**
 * Google Calendar Service - Updated cho backend mới
 * Backend tự động lấy Google OAuth2 token từ user đã đăng nhập
 */
export class GoogleCalendarService {

  /**
   * Tạo sự kiện Calendar từ task
   * @param taskId ID của task
   * @param calendarData Dữ liệu để tạo calendar event (không cần accessToken)
   * @returns Promise<CalendarEventResponse>
   */
  static async createCalendarEvent(
    taskId: number | string,
    calendarData: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    try {
      console.log('🔥 Creating calendar event for task:', taskId);
      console.log('📝 Calendar data:', calendarData);

      const endpoint = `/api/tasks/my-tasks/${taskId}/calendar-event`;
      console.log('🎯 API Endpoint:', endpoint);

      const response = await api.post<CalendarEventResponse>(endpoint, calendarData);

      console.log('✅ Calendar event created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating calendar event:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📊 Response data:', error.response.data);
        console.error('📊 Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('📡 Request error:', error.request);
      } else {
        console.error('⚠️ General error:', error.message);
      }

      // Provide more specific error messages
      if (error.response?.status === 500) {
        throw new Error(`Server error (500): ${error.response?.data?.message || 'Internal server error. Có thể backend chưa hỗ trợ Google Calendar hoặc thiếu cấu hình OAuth2.'}`);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập lại hoặc kết nối Google Calendar.');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found: Có thể backend chưa implement Google Calendar API.');
      } else {
        throw new Error(error.response?.data?.message || 'Không thể tạo sự kiện Calendar. Vui lòng thử lại.');
      }
    }
  }

  /**
   * Tạo cuộc họp nhanh (Quick Meeting)
   * @param taskId ID của task
   * @param meetingParams Tham số cho cuộc họp nhanh
   * @returns Promise<QuickMeetingResponse>
   */
  static async createQuickMeeting(
    taskId: number | string,
    meetingParams: QuickMeetingParams = {}
  ): Promise<QuickMeetingResponse> {
    try {
      // Tạo query parameters
      const queryParams = new URLSearchParams();

      if (meetingParams.title) queryParams.append('title', meetingParams.title);
      if (meetingParams.description) queryParams.append('description', meetingParams.description);
      if (meetingParams.startTime) queryParams.append('startTime', meetingParams.startTime);
      if (meetingParams.durationMinutes) queryParams.append('durationMinutes', meetingParams.durationMinutes.toString());
      if (meetingParams.attendeeEmails) queryParams.append('attendeeEmails', meetingParams.attendeeEmails);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/api/tasks/my-tasks/${taskId}/quick-meeting?${queryString}`
        : `/api/tasks/my-tasks/${taskId}/quick-meeting`;

      const response = await api.post<QuickMeetingResponse>(endpoint);

      return response.data;
    } catch (error) {
      console.error('Error creating quick meeting:', error);
      throw new Error('Không thể tạo cuộc họp nhanh. Vui lòng thử lại.');
    }
  }

  /**
   * Xóa sự kiện Calendar
   * @param taskId ID của task
   * @param eventId ID của calendar event
   * @returns Promise<DeleteEventResponse>
   */
  static async deleteCalendarEvent(
    taskId: number | string,
    eventId: string
  ): Promise<DeleteEventResponse> {
    try {
      const response = await api.delete<DeleteEventResponse>(
        `/api/tasks/my-tasks/${taskId}/calendar-event/${eventId}`
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Không thể xóa sự kiện Calendar. Vui lòng thử lại.');
    }
  }

  /**
   * Cập nhật sự kiện Calendar
   * @param taskId ID của task
   * @param eventId ID của calendar event
   * @param updateData Dữ liệu cập nhật (không cần accessToken)
   * @returns Promise<CalendarEventResponse>
   */
  static async updateCalendarEvent(
    taskId: number | string,
    eventId: string,
    updateData: UpdateCalendarEventRequest
  ): Promise<CalendarEventResponse> {
    try {
      const response = await api.put<CalendarEventResponse>(
        `/api/tasks/my-tasks/${taskId}/calendar-event/${eventId}`,
        updateData
      );

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Không thể cập nhật sự kiện Calendar. Vui lòng thử lại.');
    }
  }

  /**
   * Lập lịch nhắc nhở cho task
   * @param taskId ID của task
   * @param reminderTime Thời gian nhắc nhở
   * @param reminderMinutes Số phút nhắc nhở trước
   * @returns Promise<CalendarEventResponse>
   */
  static async scheduleReminder(
    taskId: number | string,
    reminderTime: string,
    reminderMinutes: number = 30
  ): Promise<CalendarEventResponse> {
    try {
      const queryParams = new URLSearchParams({
        reminderTime,
        reminderMinutes: reminderMinutes.toString()
      });

      const response = await api.post<CalendarEventResponse>(
        `/api/tasks/my-tasks/${taskId}/schedule-reminder?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw new Error('Không thể lập lịch nhắc nhở. Vui lòng thử lại.');
    }
  }

  /**
   * Kiểm tra trạng thái Calendar của task
   * @param taskId ID của task
   * @returns Promise<any>
   */
  static async getCalendarStatus(taskId: number | string): Promise<any> {
    try {
      const response = await api.get(
        `/api/tasks/my-tasks/${taskId}/calendar-status`
      );

      return response.data;
    } catch (error) {
      console.error('Error getting calendar status:', error);
      throw new Error('Không thể kiểm tra trạng thái Calendar.');
    }
  }
}

// Helper functions cho việc sử dụng service - Updated

/**
 * Tạo sự kiện Calendar với cấu hình mặc định - KHÔNG CẦN accessToken
 */
export const createDefaultCalendarEvent = async (
  taskId: number | string,
  title?: string
) => {
  const defaultData: CalendarEventRequest = {
    // Không cần accessToken nữa!
    customTitle: title || 'Meeting từ MyTask',
    customStartTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 phút từ bây giờ
    durationMinutes: 60,
    createMeet: true,
    reminderMinutes: [15, 5],
    eventColor: '2' // Sage color
  };

  return GoogleCalendarService.createCalendarEvent(taskId, defaultData);
};

/**
 * Tạo cuộc họp nhanh với cấu hình mặc định - KHÔNG CẦN accessToken
 */
export const createDefaultQuickMeeting = async (
  taskId: number | string,
  title?: string,
  attendeeEmails?: string[]
) => {
  const defaultParams: QuickMeetingParams = {
    title: title || 'Quick Meeting',
    startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 phút từ bây giờ
    durationMinutes: 30,
    attendeeEmails: attendeeEmails?.join(',')
  };

  return GoogleCalendarService.createQuickMeeting(taskId, defaultParams);
};

// Export default
export default GoogleCalendarService;
