"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Calendar, User, Building } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskSection as TaskSectionType, TaskListItem, TaskListActions, TaskStatus } from './types';
import TaskRow from './TaskRow';
import TaskCard from './TaskCard';
import DueDatePicker from '@/app/projects/list/components/DueDatePicker';
import { EnhancedCalendar } from '@/components/features/EnhancedCalendar';

interface TaskSectionProps {
  section: TaskSectionType;
  actions?: TaskListActions;
  selectedTasks?: string[];
  onSelectTask?: (taskId: string) => void;
  onSelectAll?: (taskIds: string[]) => void;
  viewMode?: 'table' | 'cards';
  className?: string;
}

const TaskSection = ({
  section,
  actions,
  selectedTasks = [],
  onSelectTask,
  onSelectAll,
  viewMode = 'table',
  className = '',
}) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(section.collapsed || false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');
  const [isEnhancedCalendarOpen, setIsEnhancedCalendarOpen] = useState(false);
  const [enhancedDateData, setEnhancedDateData] = useState<{
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  const handleToggleCollapse = () => {
    if (section.collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      const allSelected = section.tasks.every(task => selectedTasks.includes(task.id));
      if (allSelected) {
        // Deselect all tasks in this section
        const remainingSelected = selectedTasks.filter(id =>
          !section.tasks.some(task => task.id === id)
        );
        onSelectAll(remainingSelected);
      } else {
        // Select all tasks in this section
        const newSelected = [...selectedTasks];
        section.tasks.forEach(task => {
          if (!newSelected.includes(task.id)) {
            newSelected.push(task.id);
          }
        });
        onSelectAll(newSelected);
      }
    }
  };

  const handleEnhancedCalendarSave = (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    repeatType: string;
    repeatDays: string[];
  }) => {
    // Convert dd/mm/yy format to readable format
    const parseDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [day, month, year] = dateStr.split('/');
      const date = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
    };

    const startDateFormatted = parseDate(data.startDate);
    const endDateFormatted = parseDate(data.endDate);

    // Create date range display
    let dateDisplay = '';
    if (startDateFormatted && endDateFormatted) {
      if (startDateFormatted === endDateFormatted) {
        dateDisplay = startDateFormatted;
      } else {
        dateDisplay = `${startDateFormatted} - ${endDateFormatted}`;
      }

      // Add time if available
      if (data.startTime || data.endTime) {
        const timeStr = [];
        if (data.startTime) timeStr.push(data.startTime);
        if (data.endTime && data.endTime !== data.startTime) timeStr.push(data.endTime);
        if (timeStr.length > 0) {
          dateDisplay += ` ${timeStr.join('-')}`;
        }
      }
    }

    setNewTaskDueDate(dateDisplay);
    setEnhancedDateData({
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime
    });
  };

  // Always show sections even if empty to allow adding tasks
  // if (section.tasks.length === 0) return null;

  const isAllSelected = section.tasks.length > 0 && section.tasks.every(task => selectedTasks.includes(task.id));
  const isIndeterminate = section.tasks.some(task => selectedTasks.includes(task.id)) && !isAllSelected;

  return (
    <div className={`mb-6 ${className}`}>
      {/* Table headers are now handled in TaskList.tsx for proper sticky behavior */}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleToggleCollapse}
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.secondary;
          }}
          disabled={!section.collapsible}
        >
          {section.collapsible && (
            <>
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </>
          )}
          <span>{section.title}</span>
          <span className="ml-1 text-xs font-normal">({section.tasks.length})</span>
        </button>


      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {section.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      actions={actions}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={onSelectTask}
                    />
                  ))}

                  {/* Add task row */}
                  <tr className="group border-l-2 border-transparent hover:border-l-blue-400 transition-colors">
                    {/* Task Name */}
                    <td className="flex-1 min-w-[300px] py-3 px-2">
                      {isAddingTask ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <div className="w-3 h-3 border border-gray-400 rounded"></div>
                          </div>
                          <input
                            type="text"
                            value={newTaskName || ''}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            className="flex-1 text-sm bg-transparent border-none outline-none"
                            style={{ color: theme.text.primary }}
                            placeholder="Task name"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 cursor-pointer"
                          onClick={() => setIsAddingTask(true)}
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-sm">Add task...</span>
                        </div>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="w-[120px] py-3 px-2">
                      {isAddingTask && (
                        <button
                          onClick={() => setIsEnhancedCalendarOpen(true)}
                          className="flex items-center gap-1 w-full px-2 py-1 text-xs rounded border border-gray-300 hover:border-blue-500 transition-colors"
                          style={{
                            backgroundColor: theme.background.secondary,
                            color: theme.text.primary
                          }}
                        >
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">
                            {newTaskDueDate || 'Set date'}
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Collaborators */}
                    <td className="w-[150px] py-3 px-2">
                      {isAddingTask && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Unassigned</span>
                        </div>
                      )}
                    </td>

                    {/* Projects */}
                    <td className="w-[150px] py-3 px-2">
                      {isAddingTask && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={newTaskProject || ''}
                            onChange={(e) => setNewTaskProject(e.target.value)}
                            className="flex-1 text-xs bg-transparent border-none outline-none"
                            style={{ color: theme.text.primary }}
                            placeholder="Project name"
                          />
                        </div>
                      )}
                    </td>

                    {/* Task Visibility (Status) */}
                    <td className="w-[140px] py-3 px-2">
                      {isAddingTask && (
                        <select
                          value={newTaskStatus}
                          onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                          className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="w-[50px] py-3 px-2">
                      {isAddingTask && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (newTaskName.trim()) {
                                // Determine appropriate due date based on section
                                let defaultDueDate = newTaskDueDate;
                                if (!defaultDueDate && !enhancedDateData.startDate) {
                                  const today = new Date();
                                  const tomorrow = new Date(today);
                                  tomorrow.setDate(today.getDate() + 1);
                                  const nextWeek = new Date(today);
                                  nextWeek.setDate(today.getDate() + 7);

                                  switch (section.id) {
                                    case 'do-today':
                                      defaultDueDate = today.toISOString().split('T')[0];
                                      break;
                                    case 'do-next-week':
                                      defaultDueDate = nextWeek.toISOString().split('T')[0];
                                      break;
                                    case 'do-later':
                                      const laterDate = new Date(today);
                                      laterDate.setDate(today.getDate() + 14); // 2 weeks later
                                      defaultDueDate = laterDate.toISOString().split('T')[0];
                                      break;
                                    // 'recently-assigned' gets no default due date
                                  }
                                }

                                // Create task with enhanced calendar data
                                const taskData = {
                                  name: newTaskName.trim(),
                                  dueDate: defaultDueDate || undefined,
                                  startDate: enhancedDateData.startDate,
                                  endDate: enhancedDateData.endDate,
                                  startTime: enhancedDateData.startTime,
                                  endTime: enhancedDateData.endTime,
                                  hasStartTime: !!enhancedDateData.startTime,
                                  hasEndTime: !!enhancedDateData.endTime,
                                  project: newTaskProject.trim() || undefined,
                                  status: newTaskStatus
                                };
                                actions?.onCreateTask?.(taskData);
                              }
                              // Reset form
                              setIsAddingTask(false);
                              setNewTaskName('');
                              setNewTaskDueDate('');
                              setNewTaskProject('');
                              setNewTaskStatus('todo');
                              setEnhancedDateData({});
                            }}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingTask(false);
                              setNewTaskName('');
                              setNewTaskDueDate('');
                              setNewTaskProject('');
                              setNewTaskStatus('todo');
                            }}
                            className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  actions={actions}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskSection;