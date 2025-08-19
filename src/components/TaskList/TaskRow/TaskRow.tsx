import React, { useState } from 'react';
import { GripVertical, Calendar } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TaskRowProps } from './types';
import { useTaskEditState } from './hooks/useTaskEditState';
import { useMenuState } from './hooks/useMenuState';
import { formatTaskDate } from '../utils';
import { DARK_THEME } from '@/constants/theme';

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date | null) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

import { TaskStatusButton } from './components/TaskStatusButton';
import { TaskNameEdit } from './components/TaskNameEdit';
import { TaskAssignees } from './components/TaskAssignees';
import { TaskProjects } from './components/TaskProjects';

import ButtonIcon from '@/components/ui/Button/ButtonIcon';

export const TaskRow = ({
  task,
  onTaskClick,
  onMoveTask,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskAssign,
  isDragging,
  dragHandleProps
}: TaskRowProps) => {
  const { editState, updateEditState, startEditing, stopEditing } = useTaskEditState(task.name);
  const { menuState, showMenu, hideMenu, handleContextMenu } = useMenuState();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate) : new Date());
  const [endDate, setEndDate] = useState(task.deadline ? new Date(task.deadline) : null);
  const [isHovered, setIsHovered] = useState(false);
  // Simple task action handlers that call the provided parent handlers
  const handleCompleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use consistent lowercase status values that match toBackendStatus mapping
    const isCurrentlyCompleted = task.status === 'DONE' || task.status === 'completed' || task.status === 'done' || task.completed;
    const newStatus = isCurrentlyCompleted ? 'todo' : 'completed';
    console.log('🔄 TaskRow handleCompleteTask:', {
      taskId: task.id,
      currentStatus: task.status,
      isCurrentlyCompleted,
      newStatus,
      onTaskStatusChange: !!onTaskStatusChange
    });
    onTaskStatusChange?.(task.id, newStatus);
  };

  const handleTaskNameUpdate = (newName: string) => {
    if (newName.trim() && newName !== task.name && onTaskEdit) {
      onTaskEdit({ ...task, name: newName });
    }
  };

  const handleDateUpdate = (date: Date) => {
    if (onTaskEdit) {
      onTaskEdit({
        ...task,
        dueDate: date.toISOString().split('T')[0],
        startDate: date.toISOString().split('T')[0]
      });
    }
  };

  const handleAddAssignee = (user: any) => {
    onTaskAssign?.(task.id, user);
  };

  const handleInviteUser = (email: string) => {
    // Create a temporary user object for assignment
    onTaskAssign?.(task.id, {
      id: `temp-${Date.now()}`,
      name: email,
      email: email
    });
  };

  const handleAssignProject = (project: any) => {
    if (onTaskEdit) {
      onTaskEdit({ ...task, project: project.name });
    }
  };

  const handleCreateProject = (projectName: string) => {
    if (onTaskEdit) {
      onTaskEdit({ ...task, project: projectName });
    }
  };

  const handleMoveToSection = (sectionId: string) => {
    onMoveTask?.(task.id, sectionId);
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

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && onTaskEdit) {
      const newStartDate = start.toISOString().split('T')[0];
      const newEndDate = end ? end.toISOString().split('T')[0] : newStartDate;
      
      onTaskEdit({
        ...task,
        startDate: newStartDate,
        deadline: newEndDate
      });
    }
    
    if (end) {
      setIsDatePickerOpen(false);
    }
  };



  // Format date for display
  const getFormattedDateDisplay = () => {
    // Use endDate as the actual deadline for range display
    const dateData = {
      startDate: task.startDate,
      deadline: task.endDate || task.deadline || task.dueDate, // Use endDate first for ranges
      dueDate: task.dueDate,
      endDate: task.endDate || task.deadline || task.dueDate
    };
    
    // Debug logging for TaskRow
    console.log('🎯 TaskRow date data:', {
      taskId: task.id,
      taskName: task.name,
      taskStartDate: task.startDate,
      taskDeadline: task.deadline,
      taskDueDate: task.dueDate,
      taskEndDate: task.endDate,
      dateDataForFormat: dateData
    });
    
    const formattedDate = formatTaskDate(dateData);
    console.log('📅 Formatted date result:', formattedDate);
    
    return formattedDate;
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

  // Get text color based on task status and due date
  const getDateTextColor = () => {
    if (isCompleted()) {
      return 'text-green-400'; // Green for completed tasks
    }
    if (isOverdue()) {
      return 'text-red-400'; // Red for overdue tasks
    }
    return 'text-gray-300'; // Default gray
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

  const handleSelectUser = (user: any) => {
    handleAddAssignee(user);
    handleCancelAssignee();
  };

  const handleInviteUserByEmail = () => {
    handleInviteUser(editState.assigneeInputValue);
    handleCancelAssignee();
  };

  const handleUpdateAssigneeInput = (value: string) => {
    updateEditState({
      assigneeInputValue: value,
      showUserSuggestions: value.length > 0
    });
  };

  // Project handlers
  const handleStartAddProject = () => {
    updateEditState({
      showProjectInput: true,
      projectInputValue: '',
      showProjectSuggestions: true
    });
  };

  const handleCancelProject = () => {
    updateEditState({
      showProjectInput: false,
      projectInputValue: '',
      showProjectSuggestions: false
    });
  };

  const handleSelectProject = (project: any) => {
    handleAssignProject(project);
    handleCancelProject();
  };

  const handleCreateProjectAction = () => {
    handleCreateProject(editState.projectInputValue);
    handleCancelProject();
  };

  const handleUpdateProjectInput = (value: string) => {
    updateEditState({
      projectInputValue: value,
      showProjectSuggestions: value.length > 0
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

  return (
    <>
      <div
        className={`group flex items-center py-1.5 px-2 transition-all duration-200 border-l-2 hover:border-l-blue-500 ${
          isDragging ? 'opacity-50 bg-gray-700' : 'border-l-transparent'
        }`}
        style={{
          backgroundColor: isDragging 
            ? 'rgba(75, 85, 99, 0.3)' 
            : isHovered 
              ? DARK_THEME.background.weakHover 
              : 'transparent',
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
            aria-label="Drag task"
            variant="default"
            size="sm"
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 w-4 h-4 p-0"
          />
        </div>

        {/* Task Status */}
        <TaskStatusButton
          task={task}
          onToggle={handleCompleteTask}
        />

        {/* Task Name */}
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

        {/* Due Date */}
        <div className="w-[120px] px-4 relative">
          <div
            className={`flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-colors ${getDateTextColor()}`}
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
                  background: #1e1f21 !important;
                  box-shadow: 0 0 0 1px #424244, 0 6px 12px 0 rgba(0, 0, 0, .24) !important;
                  border-radius: 4px !important;
                  border: none !important;
                  margin: 2px !important;
                }
                .custom-datepicker .react-datepicker__header {
                  background: #1e1f21 !important;
                  border-bottom: 1px solid #424244 !important;
                  border-radius: 4px 4px 0 0 !important;
                }
                .custom-datepicker .react-datepicker__current-month,
                .custom-datepicker .react-datepicker__day-name {
                  color: #ffffff !important;
                }
                .custom-datepicker .react-datepicker__navigation {
                  border: none !important;
                }
                .custom-datepicker .react-datepicker__navigation--previous {
                  border-right-color: #ffffff !important;
                }
                .custom-datepicker .react-datepicker__navigation--next {
                  border-left-color: #ffffff !important;
                }
                .custom-day {
                  color: #ffffff !important;
                  border-radius: 4px !important;
                  transition: background-color 0.2s !important;
                }
                .custom-day:hover {
                  background: #424244 !important;
                }
                .custom-day-selected {
                  background: #0066cc !important;
                  color: #ffffff !important;
                }
                .custom-day-in-range {
                  background: #004499 !important;
                  color: #ffffff !important;
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

        {/* Assignees */}
        <TaskAssignees
          task={task}
          editState={editState}
          onStartAddAssignee={handleStartAddAssignee}
          onCancelAssignee={handleCancelAssignee}
          onSelectUser={handleSelectUser}
          onInviteUser={handleInviteUserByEmail}
          onUpdateAssigneeInput={handleUpdateAssigneeInput}
        />

        {/* Projects */}
        <TaskProjects
          task={task}
          editState={editState}
          onStartAddProject={handleStartAddProject}
          onCancelProject={handleCancelProject}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProjectAction}
          onUpdateProjectInput={handleUpdateProjectInput}
        />

        {/* Task Visibility */}
        <div className="w-[140px] px-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1M9 16h1" />
            </svg>
            <span className="truncate text-xs">My workspace</span>
          </div>
        </div>
      </div>

    </>
  );
};