import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TaskRowProps } from './types';
import { useTaskEditState } from './hooks/useTaskEditState';
import { useMenuState } from './hooks/useMenuState';
import { formatTaskDate } from '../utils';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import CustomGoogleCalendarIcon from '@/components/icons/CustomGoogleCalendarIcon';
import { projectMembersService } from '@/services/projects/projectMembersService';
import { useProjectTaskGoogleCalendar } from '@/hooks/useProjectTaskGoogleCalendar';

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date | null) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

import { TaskStatusButton } from './components/TaskStatusButton';
import { TaskNameEdit } from './components/TaskNameEdit';
import { TaskAssignees } from './components/TaskAssignees';
import { ProjectTaskAssignees } from './components/ProjectTaskAssignees';
import { TaskContextMenu } from './components/TaskContextMenu';
import { TaskCommentIndicator } from './components/TaskCommentIndicator';
import { TaskPriority } from './components/TaskPriority';
import { TaskStatusDropdown } from './components/TaskStatusDropdown';

import ButtonIcon from '@/components/ui/Button/ButtonIcon';

export const TaskRow = ({
  task,
  onTaskClick,
  onMoveTask,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskAssign,
  isDragging,
  dragHandleProps,
  taskType = 'mytask',
  projectId // NEW: Add projectId prop
}: TaskRowProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const { editState, updateEditState, startEditing, stopEditing } = useTaskEditState(task.name);
  const { menuState, showMenu, hideMenu, handleContextMenu } = useMenuState();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate) : new Date());
  const [endDate, setEndDate] = useState(task.deadline ? new Date(task.deadline) : null);
  const [isHovered, setIsHovered] = useState(false);

  // Google Calendar integration for project tasks
  const { getCalendarEvent } = useProjectTaskGoogleCalendar();
  const [calendarEventInfo, setCalendarEventInfo] = useState<{
    hasCalendarEvent: boolean;
    eventId?: string;
    googleCalendarEventUrl?: string;
    isSyncedToCalendar?: boolean;
  }>({
    hasCalendarEvent: false
  });

  // Context menu handlers
  const handleMarkDone = () => {
    const isCurrentlyCompleted = task.completed || (task.status as string) === 'DONE' || task.status === 'DONE';
    const newStatus = isCurrentlyCompleted ? 'TODO' : 'DONE';
    onTaskStatusChange?.(task.id, newStatus);
  };

  const handleDeleteTask = () => {
    onTaskDelete?.(task.id);
  };

  // Simple task action handlers that call the provided parent handlers
  const handleCompleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyCompleted = task.completed || (task.status as string) === 'DONE' || task.status === 'DONE';
    const newStatus = isCurrentlyCompleted ? 'TODO' : 'DONE';
    onTaskStatusChange?.(task.id, newStatus);
  };

  const handleTaskNameUpdate = (newName: string) => {
    if (newName.trim() && newName !== task.name && onTaskEdit) {
      onTaskEdit({ ...task, name: newName });
    }
  };

  const handleAddAssignee = (user: { id: string; name: string; email?: string; avatar?: string }) => {
    // Create the assignee data object that the parent expects
    const assigneeData = {
      id: String(user.id),
      name: user.name,
      email: user.email || ''
    };

    const taskIdString = String(task.id);
    onTaskAssign?.(taskIdString, assigneeData);
  };

  const handleInviteUser = (email: string) => {
    // Call onTaskAssign directly with email - backend will handle email lookup
    if (onTaskAssign && email && email.trim()) {
      const taskIdString = String(task.id);
      const emailString = String(email).trim();
      
      // Explicit function call with proper arguments
      try {
        onTaskAssign(taskIdString, emailString);
      } catch (error) {
        console.error('Error calling onTaskAssign:', error);
      }
    }
  };

  // Task name editing handlers
  const handleSaveTaskName = (newName: string) => {
    handleTaskNameUpdate(newName);
    stopEditing();
  };

  const handleCancelTaskName = () => {
    updateEditState({ editValue: task.name });
    stopEditing();
  };

  // Date picker handlers
  const handleToggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
    if (Array.isArray(dates)) {
      const [start, end] = dates;
      setStartDate(start || new Date());
      setEndDate(end);
      
      // ✅ FIX: Chỉ gửi dữ liệu khi đã chọn xong cả range
      if (start && end && onTaskEdit) {
        const newStartDate = start.toISOString().split('T')[0];
        const newEndDate = end.toISOString().split('T')[0];
        
        const updatedTask = {
          ...task,
          startDate: newStartDate,
          deadline: newEndDate
        };

        onTaskEdit(updatedTask);
      }
      
      // Đóng picker khi đã chọn xong range (có cả start và end)
      if (start && end) {
        setIsDatePickerOpen(false);
      }
    } else if (dates) {
      // Single date selection - set cả startDate và deadline giống nhau
      setStartDate(dates);
      setEndDate(dates);
      
      if (onTaskEdit) {
        const newDate = dates.toISOString().split('T')[0];
        
        const updatedTask = {
          ...task,
          startDate: newDate,
          deadline: newDate
        };

        onTaskEdit(updatedTask);
      }
      
      setIsDatePickerOpen(false);
    }
  };



  // Format date for display
  const getFormattedDateDisplay = () => {
    const dateData = {
      startDate: task.startDate,
      deadline: task.deadline,
      dueDate: task.dueDate
    };
    
    return formatTaskDate(dateData);
  };

  // Check if task is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = task.deadline || task.dueDate;
    if (!dueDate) return false;

    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    return taskDueDate < today && task.status !== 'DONE';
  };

  // Check if task is completed
  const isCompleted = () => {
    return task.status === 'DONE';
  };

  // Get text color based on task status and due date with theme integration
  const getDateTextColor = () => {
    if (isCompleted()) {
      return theme.status.success; // Use theme success color for completed tasks
    }
    if (isOverdue()) {
      return theme.status.error; // Use theme error color for overdue tasks
    }
    return theme.text.muted; // Use theme muted text color for default
  };

  // Get Google Calendar tooltip text with multilingual support
  const getCalendarTooltipText = () => {
    const baseText = t('taskRow.syncedToGoogleCalendar');
    if (taskType === 'project' && calendarEventInfo.eventId) {
      return `${baseText} (${calendarEventInfo.eventId})`;
    } else if (taskType === 'mytask' && task.googleCalendarEventId) {
      return `${baseText} (${task.googleCalendarEventId})`;
    }
    return baseText;
  };

  // Assignee handlers
  const handleStartAddAssignee = () => {
    updateEditState({
      showAssigneeInput: true,
      assigneeInputValue: '',
      showUserSuggestions: true
    });
  };

  const handleCancelAssignee = () => {
    updateEditState({
      showAssigneeInput: false,
      assigneeInputValue: '',
      showUserSuggestions: false
    });
  };

  const handleSelectUser = (user: { id: string; name: string; email?: string }) => {
    handleAddAssignee(user);
    handleCancelAssignee();
  };

  const handleInviteUserByEmail = (email: string) => {
    handleInviteUser(email);
    handleCancelAssignee();
  };

  const handleUpdateAssigneeInput = (value: string) => {
    updateEditState({
      assigneeInputValue: value,
      showUserSuggestions: value.length > 0
    });
  };

  // Move menu handlers
  const handleShowMoveMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    showMenu(rect.right + 10, rect.top);
  };

  const handleTaskClick = () => {
    onTaskClick?.(task);
  };

  // Priority change handler - Now use dedicated onTaskPriorityChange prop
  const handlePriorityChange = (taskId: string, priority: string) => {
    onTaskPriorityChange?.(taskId, priority);
  };

  // Status change handler
  const handleStatusChange = (taskId: string, status: string) => {
    onTaskStatusChange?.(taskId, status);
  };


  // Effect to fetch Google Calendar info for project tasks
  useEffect(() => {
    const fetchCalendarInfo = async () => {
      if (taskType === 'project' && task.id) {
        try {
          const taskId = parseInt(String(task.id));

          // ✅ MINIMAL FIX: Skip if task ID looks like a timestamp (newly created task)
          if (taskId > 9999999999) { // Skip IDs > 10 billion (timestamps are 13+ digits)
            setCalendarEventInfo({ hasCalendarEvent: false });
            return;
          }

          const calendarInfo = await getCalendarEvent(taskId);

          setCalendarEventInfo({
            hasCalendarEvent: calendarInfo.hasCalendarEvent,
            eventId: calendarInfo.eventId,
            googleCalendarEventUrl: calendarInfo.googleCalendarEventUrl,
            isSyncedToCalendar: calendarInfo.isSyncedToCalendar
          });
        } catch (error) {
          // Silently handle error - no calendar event exists
          setCalendarEventInfo({ hasCalendarEvent: false });
        }
      }
    };

    fetchCalendarInfo();
  }, [task.id, taskType, getCalendarEvent]);

  return (
    <>
      <div
        className={`group flex items-center py-1.5 px-2 transition-all duration-200 border-l-2 ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={{
          backgroundColor: isDragging 
            ? `${theme.background.muted}50` // Use theme muted background with transparency
            : isHovered
              ? theme.background.weakHover // Use theme weak hover background
              : theme.background.primary, // Use theme primary background instead of transparent
          borderLeft: isDragging ? `2px solid ${theme.status.info}` : isHovered ? `2px solid ${theme.status.info}` : '2px solid transparent',
          borderBottom: `1px solid ${theme.border.default}`, // Use theme border color
          color: theme.text.primary, // Add explicit text color for light theme
          margin: 0,
          marginBottom: 0,
          marginTop: 0
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
      >
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
          {...dragHandleProps}
        >
          <ButtonIcon
            icon={GripVertical}
            onClick={() => {}}
            aria-label={t('taskRow.dragTask')}
            variant="default"
            size="sm"
            className="cursor-grab active:cursor-grabbing w-4 h-4 p-0"
            style={{
              color: theme.text.muted,
            }}
          />
        </div>

        {/* Task Status */}
        <TaskStatusButton
          task={task}
          onToggle={handleCompleteTask}
        />

        {/* Task Name */}
        <div
          className="flex-1 min-w-[300px] px-6"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <div className="flex items-center gap-2">
            <TaskNameEdit
              task={task}
              editState={editState}
              onStartEdit={startEditing}
              onSave={handleSaveTaskName}
              onCancel={handleCancelTaskName}
              onUpdateEditValue={(value) => updateEditState({ editValue: value })}
              onTaskClick={handleTaskClick}
              onShowMoveMenu={handleShowMoveMenu}
            />

            {/* Google Calendar Integration Icon with theme and multilingual support */}
            {(
              (taskType === 'mytask' && (task.isSyncedToCalendar || task.googleCalendarEventId || task.googleCalendarEventUrl)) ||
              (taskType === 'project' && calendarEventInfo.hasCalendarEvent)
            ) && (
              <div className="flex-shrink-0 ml-2">
                <div
                  className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (taskType === 'project' && calendarEventInfo.googleCalendarEventUrl) {
                      window.open(calendarEventInfo.googleCalendarEventUrl, '_blank');
                    } else if (taskType === 'mytask' && task.googleCalendarEventUrl) {
                      window.open(task.googleCalendarEventUrl, '_blank');
                    }
                  }}
                  title={getCalendarTooltipText()}
                >
                  <CustomGoogleCalendarIcon
                    size={42}
                    style={{
                      color: theme.status.info,
                    }}
                    className="hover:opacity-80 transition-opacity"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div
          className="w-[120px] px-4 relative"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <div
            className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-colors"
            style={{ color: getDateTextColor() }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDatePicker();
            }}
          >
            <span className="truncate text-xs">
              {getFormattedDateDisplay()}
            </span>
          </div>

          {isDatePickerOpen && (
            <div className="absolute z-50 mt-1 left-0">
              <style jsx global>{`
                .custom-datepicker {
                  background: ${theme.background.primary} !important;
                  box-shadow: 0 0 0 1px ${theme.border.default}, 0 6px 12px 0 ${theme.dropdown?.shadow || 'rgba(0, 0, 0, 0.15)'} !important;
                  border-radius: 4px !important;
                  border: none !important;
                  margin: 2px !important;
                  width: 100% !important;
                }
                .custom-datepicker .react-datepicker__header {
                  background: ${theme.background.primary} !important;
                  border-bottom: 1px solid ${theme.border.default} !important;
                  border-radius: 4px 4px 0 0 !important;
                }
                .custom-datepicker .react-datepicker__current-month,
                .custom-datepicker .react-datepicker__day-name {
                  color: ${theme.text.primary} !important;
                }
                .custom-datepicker .react-datepicker__navigation {
                  border: none !important;
                }
                .custom-datepicker .react-datepicker__navigation--previous {
                  border-right-color: ${theme.text.primary} !important;
                }
                .custom-datepicker .react-datepicker__navigation--next {
                  border-left-color: ${theme.text.primary} !important;
                }
                .custom-day {
                  color: ${theme.text.primary} !important;
                  border-radius: 4px !important;
                  transition: background-color 0.2s !important;
                }
                .custom-day:hover {
                  background: ${theme.background.secondary} !important;
                }
                .custom-day-selected {
                  background: ${theme.status.info} !important;
                  color: ${theme.text.primary} !important;
                }
                .custom-day-in-range {
                  background: ${theme.background.muted} !important;
                  color: ${theme.text.primary} !important;
                }
              `}</style>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                calendarClassName="custom-datepicker"
                dayClassName={date => {
                  let classes = "custom-day";
                  
                  if (isSameDay(date, startDate) || isSameDay(date, endDate)) {
                    classes += " custom-day-selected";
                  } else if (startDate && endDate && date > startDate && date < endDate) {
                    classes += " custom-day-in-range";
                  }
                  
                  return classes;
                }}
                onClickOutside={() => setIsDatePickerOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Priority */}
        <div
          className="w-[100px] px-2 flex justify-center"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <TaskPriority
            task={task}
            onPriorityChange={handlePriorityChange}
          />
        </div>

        {/* Status */}
        <div
          className="w-[120px] px-2 flex justify-center"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <TaskStatusDropdown
            task={task}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Assignees */}
        <div
          className="w-[150px] px-4"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          {taskType === 'project' && projectId ? (
            <ProjectTaskAssignees
              task={task}
              projectId={projectId}
              onSelectUser={handleSelectUser}
              onUpdateAssignees={async (taskId: string, assigneeId: number | null, additionalAssigneeIds: number[]) => {
                try {
                  const numericTaskId = parseInt(taskId);
                  await projectMembersService.updateProjectTaskAssignees(numericTaskId, assigneeId, additionalAssigneeIds);

                  if (onTaskAssign && assigneeId) {
                    const assigneeData = {
                      id: assigneeId.toString(),
                      name: t('taskRow.multiUserAssignment') || 'Multi-User Assignment',
                      email: ''
                    };
                    onTaskAssign(taskId, assigneeData);
                  }
                } catch (error) {
                  console.error('❌ Failed to update multiple assignees:', error);
                  throw error;
                }
              }}
            />
          ) : (
            <TaskAssignees
              task={task}
              editState={editState}
              onStartAddAssignee={handleStartAddAssignee}
              onCancelAssignee={handleCancelAssignee}
              onSelectUser={handleSelectUser}
              onInviteUser={handleInviteUserByEmail}
              onUpdateAssigneeInput={handleUpdateAssigneeInput}
            />
          )}
        </div>

        {/* Comments Indicator - Last column, no right border */}
        <div className="w-[140px] px-4 flex justify-center">
          <TaskCommentIndicator
            taskId={task.id}
            initialCount={task.commentCount || 0}
            taskType={taskType}
          />
        </div>
      </div>

      {/* Context Menu with multilingual support */}
      <TaskContextMenu
        task={task}
        isOpen={menuState.showContextMenu}
        position={menuState.menuPosition}
        onClose={hideMenu}
        onMarkDone={handleMarkDone}
        onDelete={handleDeleteTask}
      />
    </>
  );
};
