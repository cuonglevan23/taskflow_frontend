import React, { useState } from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { CalendarEventRequest, QuickMeetingParams } from '@/services/googleCalendarService';

interface GoogleCalendarActionsProps {
  taskId: number | string;
  taskTitle?: string;
}

/**
 * Component minh họa cách sử dụng Google Calendar Integration - Updated cho backend mới
 * Backend tự động lấy Google OAuth2 token từ user đã đăng nhập
 */
const GoogleCalendarActions: React.FC<GoogleCalendarActionsProps> = ({
  taskId,
  taskTitle = 'Task không có tiêu đề'
}) => {
  const [attendeeEmails, setAttendeeEmails] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [eventIdToDelete, setEventIdToDelete] = useState('');

  const {
    isLoading,
    error,
    lastCreatedEvent,
    lastQuickMeeting,
    createCalendarEvent,
    createQuickMeeting,
    deleteCalendarEvent,
    createDefaultEvent,
    createDefaultMeeting,
    clearError,
    reset
  } = useGoogleCalendar();

  // Tạo sự kiện Calendar từ task - KHÔNG CẦN accessToken
  const handleCreateCalendarEvent = async () => {
    const calendarData: CalendarEventRequest = {
      // Không cần accessToken nữa!
      customTitle: `📋 ${taskTitle}`,
      customStartTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 giờ từ bây giờ
      durationMinutes: 90,
      createMeet: true,
      attendeeEmails: attendeeEmails ? attendeeEmails.split(',').map(email => email.trim()) : [],
      reminderMinutes: [15, 5],
      location: 'Phòng họp A',
      eventColor: '2' // Sage color
    };

    const result = await createCalendarEvent(taskId, calendarData);
    if (result) {
      alert(`✅ Sự kiện Calendar đã được tạo!\nMeet Link: ${result.meetLink || 'Không có'}`);
    }
  };

  // Tạo cuộc họp nhanh - KHÔNG CẦN accessToken
  const handleCreateQuickMeeting = async () => {
    const meetingParams: QuickMeetingParams = {
      title: meetingTitle || `Quick Meeting: ${taskTitle}`,
      description: `Cuộc họp nhanh về task: ${taskTitle}`,
      startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 phút từ bây giờ
      durationMinutes: 45,
      attendeeEmails: attendeeEmails || undefined
    };

    const result = await createQuickMeeting(taskId, meetingParams);
    if (result) {
      alert(`🚀 Cuộc họp nhanh đã được tạo!\nMeet Link: ${result.meetLink}`);
      // Tự động mở Google Meet
      window.open(result.meetLink, '_blank');
    }
  };

  // Xóa sự kiện Calendar
  const handleDeleteEvent = async () => {
    if (!eventIdToDelete) {
      alert('Vui lòng nhập Event ID để xóa');
      return;
    }

    const success = await deleteCalendarEvent(taskId, eventIdToDelete);
    if (success) {
      alert('🗑️ Sự kiện Calendar đã được xóa thành công!');
      setEventIdToDelete('');
    }
  };

  // Tạo sự kiện mặc định - SIÊU ĐƠN GIẢN!
  const handleCreateDefaultEvent = async () => {
    const result = await createDefaultEvent(taskId, `Meeting: ${taskTitle}`);
    if (result) {
      alert(`✅ Sự kiện mặc định đã được tạo!\nMeet Link: ${result.meetLink || 'Không có'}`);
    }
  };

  // Tạo cuộc họp mặc định - SIÊU ĐƠN GIẢN!
  const handleCreateDefaultMeeting = async () => {
    const emails = attendeeEmails ? attendeeEmails.split(',').map(email => email.trim()) : undefined;
    const result = await createDefaultMeeting(taskId, `Quick Discussion: ${taskTitle}`, emails);
    if (result) {
      alert(`🚀 Cuộc họp mặc định đã được tạo!\nMeet Link: ${result.meetLink}`);
      window.open(result.meetLink, '_blank');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📅 Google Calendar Integration - SIMPLIFIED!
      </h2>
      <p className="text-gray-600 mb-6">Task: <strong>{taskTitle}</strong> (ID: {taskId})</p>

      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        <p><strong>🎉 CẢI TIẾN MỚI:</strong> Không cần nhập Google Access Token nữa!</p>
        <p>Backend tự động lấy từ user đã đăng nhập OAuth2.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>❌ {error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Xóa lỗi
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          ⏳ Đang xử lý...
        </div>
      )}

      {/* Input Fields - Đã đơn giản hóa */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email người tham gia (phân cách bằng dấu phẩy):
          </label>
          <input
            type="text"
            value={attendeeEmails}
            onChange={(e) => setAttendeeEmails(e.target.value)}
            placeholder="user1@company.com, user2@company.com"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề cuộc họp (tùy chọn):
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Nhập tiêu đề cuộc họp"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event ID để xóa:
          </label>
          <input
            type="text"
            value={eventIdToDelete}
            onChange={(e) => setEventIdToDelete(e.target.value)}
            placeholder="Nhập Event ID từ Google Calendar"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons - Đã cải tiến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCreateCalendarEvent}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          📅 Tạo sự kiện Calendar (Chi tiết)
        </button>

        <button
          onClick={handleCreateQuickMeeting}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🚀 Tạo cuộc họp nhanh
        </button>

        <button
          onClick={handleDeleteEvent}
          disabled={isLoading || !eventIdToDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🗑️ Xóa sự kiện
        </button>

        <button
          onClick={handleCreateDefaultEvent}
          disabled={isLoading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ⚡ Tạo sự kiện mặc định
        </button>

        <button
          onClick={handleCreateDefaultMeeting}
          disabled={isLoading}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ⚡ Tạo họp mặc định
        </button>

        <button
          onClick={reset}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🔄 Reset
        </button>
      </div>

      {/* Results Display */}
      {lastCreatedEvent && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800 mb-2">✅ Sự kiện Calendar vừa tạo:</h3>
          <div className="text-sm text-green-700">
            <p><strong>Event ID:</strong> {lastCreatedEvent.eventId}</p>
            <p><strong>Tiêu đề:</strong> {lastCreatedEvent.title}</p>
            <p><strong>Thời gian:</strong> {new Date(lastCreatedEvent.startTime).toLocaleString()}</p>
            {lastCreatedEvent.meetLink && (
              <p>
                <strong>Google Meet:</strong>{' '}
                <a
                  href={lastCreatedEvent.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:no-underline"
                >
                  Tham gia cuộc họp
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {lastQuickMeeting && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
          <h3 className="font-bold text-blue-800 mb-2">🚀 Cuộc họp nhanh vừa tạo:</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Event ID:</strong> {lastQuickMeeting.eventId}</p>
            <p><strong>Tiêu đề:</strong> {lastQuickMeeting.title}</p>
            <p><strong>Thời lượng:</strong> {lastQuickMeeting.durationMinutes} phút</p>
            <p>
              <strong>Google Meet:</strong>{' '}
              <a
                href={lastQuickMeeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:no-underline"
              >
                Tham gia ngay
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold text-yellow-800 mb-2">💡 Lưu ý quan trọng:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Không cần nhập Access Token</strong> - Backend tự động lấy từ OAuth2</li>
          <li>• <strong>Chỉ cần JWT token</strong> của user đã đăng nhập</li>
          <li>• <strong>Nếu chưa kết nối Google Calendar</strong> - hệ thống sẽ redirect để authorize</li>
          <li>• <strong>Nếu token hết hạn</strong> - hệ thống sẽ yêu cầu kết nối lại</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleCalendarActions;
