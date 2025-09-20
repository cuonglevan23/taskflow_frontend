import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskListItem } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useProjectTaskGoogleCalendar, CalendarEventInfo } from '@/hooks/useProjectTaskGoogleCalendar';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'; // 🔥 Import MyTask hook
import GoogleMeetIcon from '@/components/icons/GoogleMeetIcon';

interface GoogleCalendarIntegrationProps {
  task: TaskListItem | null;
  title: string;
  description: string;
  computedAssignees: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  onTaskRefresh?: () => void;
  taskType?: 'mytask' | 'project'; // 🔥 Add taskType prop to determine which hook to use
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  task,
  title,
  description,
  computedAssignees,
  onTaskRefresh,
  taskType = 'project' // 🔥 Default to project
}) => {
  const taskId = task?.id ? String(task.id) : null;

  // 🔥 State for ProjectTask calendar info
  const [projectCalendarInfo, setProjectCalendarInfo] = useState<CalendarEventInfo | null>(null);
  const [fetchingCalendarInfo, setFetchingCalendarInfo] = useState(false);

  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // ✅ FIXED: Check if task is optimistic (temporary)
  const isOptimisticTask = useMemo(() => {
    if (!task || !taskId) return false;
    const taskIdNumber = Number(taskId);
    return (task as any)?.isOptimistic || taskIdNumber > 1000000000000;
  }, [task, taskId]);

  // 🔥 Use hooks separately - DON'T mix them conditionally
  const projectTaskCalendar = useProjectTaskGoogleCalendar(); // Always call this
  const myTaskCalendar = useGoogleCalendar(); // Always call this

  // 🔥 Then conditionally destructure what we need
  const {
    isLoading: calendarLoading,
    error: calendarError,
    clearError: clearCalendarError,
    createQuickMeeting
  } = taskType === 'mytask' ? myTaskCalendar : projectTaskCalendar;

  // 🔥 For ProjectTask, we need getCalendarEvent method specifically
  const { getCalendarEvent } = projectTaskCalendar;

  // 🔥 Fetch calendar info for ProjectTask ONLY
  useEffect(() => {
    const fetchProjectCalendarInfo = async () => {
      if (taskType === 'project' && taskId && getCalendarEvent) {
        // ✅ FIXED: Skip optimistic tasks and tasks with timestamp-like IDs
        const taskIdNumber = Number(taskId);

        // Check if task is optimistic (has isOptimistic flag) or has timestamp-like ID
        if ((task as any)?.isOptimistic || taskIdNumber > 1000000000000) {
          console.log('🚫 Skipping Google Calendar API for optimistic/new task:', taskIdNumber);
          return;
        }

        setFetchingCalendarInfo(true);
        try {
          const calendarInfo = await getCalendarEvent(taskIdNumber);
          setProjectCalendarInfo(calendarInfo);
        } catch (error) {
          console.log('⚠️ Failed to fetch calendar info for task:', taskIdNumber, error);
          setProjectCalendarInfo(null);
        } finally {
          setFetchingCalendarInfo(false);
        }
      }
    };

    fetchProjectCalendarInfo();
  }, [taskType, taskId, getCalendarEvent, task]);

  // 🔥 Helper function to get calendar sync status based on task type
  const getCalendarSyncData = () => {
    if (taskType === 'mytask') {
      // MyTask: Use task data fields
      return {
        isSynced: task?.isSyncedToCalendar,
        eventId: task?.googleCalendarEventId,
        eventUrl: task?.googleCalendarEventUrl,
        meetLink: task?.googleMeetLink,
        syncedAt: task?.calendarSyncedAt
      };
    } else {
      // ProjectTask: Use fetched calendar info
      return {
        isSynced: projectCalendarInfo?.isSyncedToCalendar || projectCalendarInfo?.hasCalendarEvent,
        eventId: projectCalendarInfo?.eventId,
        eventUrl: projectCalendarInfo?.googleCalendarEventUrl,
        meetLink: projectCalendarInfo?.googleMeetLink,
        syncedAt: projectCalendarInfo?.calendarSyncedAt
      };
    }
  };

  const calendarData = getCalendarSyncData();

  // 🔥 Helper function to handle calendar errors
  const handleCalendarError = (error: any) => {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        const shouldAuth = confirm(
          t('googleCalendar.errors.notConnected') + '\n' +
          t('googleCalendar.errors.connectPrompt')
        );
        if (shouldAuth) {
          const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
          window.open(googleAuthUrl, '_blank');
        }
      } else if (error.message.includes('Backend failed to create')) {
        // 🔥 Enhanced error handling for ProjectTask backend issues
        if (taskType === 'project') {
          const shouldAuth = confirm(
            t('googleCalendar.errors.backendCreateFailed') + '\n\n' +
            t('googleCalendar.errors.projectNotConnected') + '\n' +
            t('googleCalendar.errors.connectQuestion')
          );
          if (shouldAuth) {
            const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
            window.open(googleAuthUrl, '_blank');
          }
        } else {
          alert(`❌ ${error.message}`);
        }
      } else {
        alert(`❌ ${error.message}`);
      }
    } else {
      alert(t('googleCalendar.errors.generalError'));
    }
  };

  const handleCreateQuickMeeting = async () => {
    if (!taskId) {
      alert(t('googleCalendar.errors.invalidTaskId'));
      return;
    }

    try {
      if (taskType === 'mytask') {
        // 🔥 MyTask logic - attendeeEmails as STRING (REVERT TO ORIGINAL WORKING STATE)
        const options = {
          title: `${t('googleCalendar.quickMeeting.title')}: ${title}`,
          description: `${t('googleCalendar.quickMeeting.description')}: ${title}`,
          startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          durationMinutes: 30,
          attendeeEmails: computedAssignees?.map(a => a.email).filter(Boolean).join(',') // String format for MyTask
        };

        const result = await (createQuickMeeting as any)(Number(taskId), options);

        // 🔥 MyTask returns QuickMeetingResponse | null (ORIGINAL LOGIC)
        if (result && result.meetLink) {
          alert(`${t('googleCalendar.success.meetingCreated')}\n${t('googleCalendar.googleMeet')}: ${result.meetLink}`);
          window.open(result.meetLink, '_blank');
        } else if (result) {
          alert(t('googleCalendar.success.meetingCreatedGeneral'));
        }
        onTaskRefresh?.();
      } else {
        // 🔥 ProjectTask logic - attendeeEmails as ARRAY, fix type logic
        const options = {
          title: `${t('googleCalendar.quickMeeting.title')}: ${title}`,
          description: `${t('googleCalendar.quickMeeting.description')}: ${title}`,
          startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          durationMinutes: 30,
          attendeeEmails: computedAssignees?.map(a => a.email).filter(Boolean) || [] // Array format for ProjectTask
        };

        const result = await (createQuickMeeting as any)(Number(taskId), options);

        // 🔥 ProjectTask returns CalendarEventResponse - fix logic to handle success: null properly
        if (result.meetLink) {
          alert(`${t('googleCalendar.success.meetingCreated')}\n${t('googleCalendar.googleMeet')}: ${result.meetLink}`);
          window.open(result.meetLink, '_blank');

          // 🔥 FIXED: Refresh calendar info immediately for ProjectTask
          if (getCalendarEvent && taskId) {
            try {
              const updatedCalendarInfo = await getCalendarEvent(Number(taskId));
              setProjectCalendarInfo(updatedCalendarInfo);
            } catch (refreshError) {
              console.log('⚠️ Failed to refresh calendar info after quick meeting creation:', refreshError);
            }
          }
        } else if (result.success === true) {
          alert(t('googleCalendar.success.meetingCreatedGeneral'));

          // 🔥 FIXED: Refresh calendar info immediately for ProjectTask
          if (getCalendarEvent && taskId) {
            try {
              const updatedCalendarInfo = await getCalendarEvent(Number(taskId));
              setProjectCalendarInfo(updatedCalendarInfo);
            } catch (refreshError) {
              console.log('⚠️ Failed to refresh calendar info after quick meeting creation:', refreshError);
            }
          }
        } else {
          // Handle both success: false and success: null as failure
          alert(t('googleCalendar.errors.meetingCreateFailed'));
        }
        onTaskRefresh?.();
      }
    } catch (error) {
      console.error('💥 Error creating quick meeting:', error);
      handleCalendarError(error);
    }
  };

  // 🔥 SEPARATED: MyTask Calendar Event Handler
  const handleMyTaskAddToCalendar = async () => {
    if (!taskId) {
      alert(t('googleCalendar.errors.invalidTaskId'));
      return;
    }

    try {
      // 🔥 MyTask-specific date handling
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      let startTime: string;
      if (task?.startDate) {
        const taskStartDate = new Date(task.startDate);
        startTime = taskStartDate > now ? taskStartDate.toISOString() : now.toISOString();
      } else {
        startTime = now.toISOString();
      }

      let endTime: string;
      if (task?.deadline) {
        const taskDeadline = new Date(task.deadline);
        const minEndTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000);
        endTime = taskDeadline > minEndTime ? taskDeadline.toISOString() : oneHourLater.toISOString();
      } else {
        endTime = oneHourLater.toISOString();
      }

      if (new Date(startTime) >= new Date(endTime)) {
        endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
      }

      console.log('📅 MyTask Calendar event time range:', { startTime, endTime });

      const eventData = {
        customTitle: title,
        customDescription: description,
        customStartTime: startTime,
        customEndTime: endTime,
        durationMinutes: Math.max(30, Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))),
        attendeeEmails: computedAssignees?.map(a => a.email).filter(Boolean), // Array format
        createMeet: true
      };

      console.log('📝 MyTask calendar event data:', eventData);

      const result = await myTaskCalendar.createCalendarEvent(Number(taskId), eventData);

      if (result && result.eventId) {
        alert(`${t('googleCalendar.success.eventCreated')}\n${t('googleCalendar.eventId')}: ${result.eventId}`);
      } else if (result) {
        alert(t('googleCalendar.success.eventCreatedGeneral'));
      }
      onTaskRefresh?.();
    } catch (error) {
      console.error('💥 Error creating MyTask calendar event:', error);
      handleCalendarError(error);
    }
  };

  // 🔥 SEPARATED: ProjectTask Calendar Event Handler
  const handleProjectTaskAddToCalendar = async () => {
    if (!taskId) {
      alert(t('googleCalendar.errors.invalidTaskId'));
      return;
    }

    try {
      // 🔥 ProjectTask-specific date handling
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      let startTime: string;
      if (task?.startDate) {
        const taskStartDate = new Date(task.startDate);
        startTime = taskStartDate > now ? taskStartDate.toISOString() : now.toISOString();
      } else {
        startTime = now.toISOString();
      }

      let endTime: string;
      if (task?.deadline) {
        const taskDeadline = new Date(task.deadline);
        const minEndTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000);
        endTime = taskDeadline > minEndTime ? taskDeadline.toISOString() : oneHourLater.toISOString();
      } else {
        endTime = oneHourLater.toISOString();
      }

      if (new Date(startTime) >= new Date(endTime)) {
        endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
      }

      console.log('📅 ProjectTask Calendar event time range:', { startTime, endTime });

      const eventData = {
        customTitle: title,
        customDescription: description,
        customStartTime: startTime,
        customEndTime: endTime,
        durationMinutes: Math.max(30, Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))),
        attendeeEmails: computedAssignees?.map(a => a.email).filter(Boolean), // Array format
        createMeet: true
      };

      console.log('📝 ProjectTask calendar event data:', eventData);

      const result = await projectTaskCalendar.createCalendarEvent(Number(taskId), eventData);

      if (result.eventId) {
        alert(`${t('googleCalendar.success.eventCreated')}\n${t('googleCalendar.eventId')}: ${result.eventId}`);

        // 🔥 ProjectTask-specific: Refresh calendar info immediately
        if (getCalendarEvent && taskId) {
          try {
            const updatedCalendarInfo = await getCalendarEvent(Number(taskId));
            setProjectCalendarInfo(updatedCalendarInfo);
          } catch (refreshError) {
            console.log('⚠️ Failed to refresh calendar info after event creation:', refreshError);
          }
        }
        onTaskRefresh?.();
      } else if (result.success === true) {
        alert(t('googleCalendar.success.eventCreatedGeneral'));

        // 🔥 ProjectTask-specific: Refresh calendar info immediately
        if (getCalendarEvent && taskId) {
          try {
            const updatedCalendarInfo = await getCalendarEvent(Number(taskId));
            setProjectCalendarInfo(updatedCalendarInfo);
          } catch (refreshError) {
            console.log('⚠️ Failed to refresh calendar info after event creation:', refreshError);
          }
        }
        onTaskRefresh?.();
      } else {
        alert(t('googleCalendar.errors.eventCreateFailed'));
      }
    } catch (error) {
      console.error('💥 Error creating ProjectTask calendar event:', error);
      handleCalendarError(error);
    }
  };

  // 🔥 UNIFIED: Main handler that delegates to specific handlers
  const handleAddToCalendar = async () => {
    if (taskType === 'mytask') {
      await handleMyTaskAddToCalendar();
    } else {
      await handleProjectTaskAddToCalendar();
    }
  };

  if (!task) return null;


  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: theme.text.primary }}>
        <Calendar className="w-4 h-4" />
        {t('googleCalendar.title')}
      </h3>

      <div className="border rounded-lg p-4" style={{ borderColor: theme.border.default }}>
        {/* 🔥 Use calendarData from helper function instead of task fields */}
        {calendarData.isSynced ? (
          // Task đã sync với Google Calendar
          <div className="space-y-3">
            {/* Sync Status Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('googleCalendar.status.synced')}
              </span>
              {calendarData.syncedAt && (
                <span className="text-xs" style={{ color: theme.text.muted }}>
                  {t('googleCalendar.lastSynced')}: {new Date(calendarData.syncedAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Calendar Actions */}
            <div className="flex flex-wrap gap-2">
              {calendarData.eventUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(calendarData.eventUrl!, '_blank')}
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{t('googleCalendar.actions.viewInCalendar')}</span>
                </Button>
              )}

              {calendarData.meetLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(calendarData.meetLink!, '_blank')}
                  className="text-green-400 border-green-400/30 hover:bg-green-400/10 flex items-center gap-1.5"
                >
                  <GoogleMeetIcon className="text-green-400" size={14} />
                  <span className="text-xs">{t('googleCalendar.actions.joinMeet')}</span>
                </Button>
              )}
            </div>

            {/* Event Details */}
            {calendarData.eventId && (
              <div className="text-xs space-y-1" style={{ color: theme.text.muted }}>
                <div>{t('googleCalendar.eventId')}: <span className="font-mono">{calendarData.eventId}</span></div>
              </div>
            )}
          </div>
        ) : (
          // Task chưa sync với Google Calendar
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2" style={{ color: theme.text.muted }}>
              <Circle className="w-4 h-4" />
              <span className="text-sm">{t('googleCalendar.status.notSynced')}</span>
            </div>

            {/* ✅ FIXED: Show message when task is optimistic */}
            {isOptimisticTask ? (
              <div
                className="p-3 border rounded text-xs"
                style={{
                  backgroundColor: theme.status.warning + '20',
                  borderColor: theme.status.warning + '30',
                  color: theme.status.warning
                }}
              >
                {t('googleCalendar.status.saving')}
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                  disabled={calendarLoading || fetchingCalendarInfo || !taskId}
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{t('googleCalendar.actions.addToCalendar')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateQuickMeeting}
                  disabled={calendarLoading || fetchingCalendarInfo || !taskId}
                  className="text-green-400 border-green-400/30 hover:bg-green-400/10 flex items-center gap-1.5"
                >
                  <GoogleMeetIcon className="text-green-400" size={14} />
                  <span className="text-xs">{t('googleCalendar.actions.quickMeeting')}</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading State for Calendar Info Fetch */}
        {fetchingCalendarInfo && (
          <div
            className="mt-3 p-2 border rounded text-xs"
            style={{
              backgroundColor: theme.status.info + '20',
              borderColor: theme.status.info + '30',
              color: theme.status.info
            }}
          >
            {t('googleCalendar.loading.calendarInfo')}
          </div>
        )}

        {/* Calendar Error Display */}
        {calendarError && (
          <div
            className="mt-3 p-2 border rounded text-xs flex items-center justify-between"
            style={{
              backgroundColor: theme.status.error + '20',
              borderColor: theme.status.error + '30',
              color: theme.status.error
            }}
          >
            <span>❌ {calendarError}</span>
            <button
              onClick={clearCalendarError}
              className="ml-2 hover:opacity-70"
              style={{ color: theme.status.error }}
            >
              ✕
            </button>
          </div>
        )}

        {calendarLoading && (
          <div
            className="mt-3 p-2 border rounded text-xs"
            style={{
              backgroundColor: theme.status.info + '20',
              borderColor: theme.status.info + '30',
              color: theme.status.info
            }}
          >
            {t('googleCalendar.loading.processing')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarIntegration;
