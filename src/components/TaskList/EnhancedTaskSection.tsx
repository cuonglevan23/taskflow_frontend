"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Calendar, User, Building } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskSection as TaskSectionType, TaskListActions, TaskStatus } from './types';
import EnhancedTaskRow from './EnhancedTaskRow';
import { taskService } from '@/services/tasks';
import { CreateTaskDTO } from '@/types/task';
import { CookieAuth } from '@/utils/cookieAuth';
import { TaskListItem } from './types';
import { useRouter } from 'next/navigation';

interface EnhancedTaskSectionProps {
  section: TaskSectionType;
  actions?: TaskListActions;
  selectedTasks?: string[];
  onSelectTask?: (taskId: string) => void;
  onSelectAll?: (taskIds: string[]) => void;
  onTaskAdded?: (newTask: any, sectionId: string) => void; // callback để báo cho cha
  revalidate?: () => void; // Thêm prop revalidate
  className?: string;
}

const EnhancedTaskSection: React.FC<EnhancedTaskSectionProps> = ({
  section,
  actions,
  selectedTasks = [],
  onSelectTask,
  onSelectAll,
  onTaskAdded,
  revalidate, // Thêm prop revalidate
  className = '',
}) => {
  const { theme } = useTheme();
  const router = useRouter();

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
  const [tasks, setTasks] = useState(section.tasks); // Thêm state cục bộ cho tasks

  // Khi nhận prop section thay đổi, cập nhật lại tasks
  React.useEffect(() => {
    setTasks(section.tasks);
  }, [section.tasks]);

  const handleToggleCollapse = () => {
    if (section.collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      const allSelected = section.tasks.every(task => selectedTasks.includes(task.id));
      if (allSelected) {
        const remainingSelected = selectedTasks.filter(id =>
          !section.tasks.some(task => task.id === id)
        );
        onSelectAll(remainingSelected);
      } else {
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

    let dateDisplay = '';
    if (startDateFormatted && endDateFormatted) {
      if (startDateFormatted === endDateFormatted) {
        dateDisplay = startDateFormatted;
      } else {
        dateDisplay = `${startDateFormatted} - ${endDateFormatted}`;
      }
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
    setIsEnhancedCalendarOpen(false);
  };

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      let defaultDueDate = newTaskDueDate;
      if (!defaultDueDate && !enhancedDateData.startDate) {
        const today = new Date();
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
            laterDate.setDate(today.getDate() + 14);
            defaultDueDate = laterDate.toISOString().split('T')[0];
            break;
        }
      }

      const tokenPayload = CookieAuth.getTokenPayload();
      const taskData: CreateTaskDTO = {
        title: newTaskName.trim(),
        description: '',
        status: newTaskStatus,
        priority: 'normal',
        startDate: enhancedDateData.startDate || defaultDueDate || new Date().toISOString().split('T')[0],
        deadline: enhancedDateData.endDate || defaultDueDate,
        creatorId: tokenPayload?.userId,
        assignedToIds: [],
        tags: [],
      };

      try {
        const created = await taskService.createTask(taskData);

        // Map the returned object to the UI's TaskListItem shape to satisfy TS types.
        // Adjust fields mapping as needed if your API uses different property names.
        const mapped: TaskListItem = {
          id: (created as any).id ?? String(Date.now()),
          // UI expects `name` while API may return `title`
          name: (created as any).name ?? (created as any).title ?? newTaskName.trim(),
          // include common fields used by the row component
          assignees: (created as any).assignedToIds
            ? (created as any).assignedToIds.map((aid: string) => ({ id: aid }))
            : [],
            status: (created as any).status ?? newTaskStatus,
          createdAt: (created as any).createdAt ?? (created as any).created_at ?? new Date().toISOString(),
          updatedAt: (created as any).updatedAt ?? (created as any).updated_at ?? new Date().toISOString(),
          // preserve other properties so the component can access them if needed
          ...(created as any),
        } as TaskListItem;

        setTasks(prev => [mapped, ...prev]);
        router.refresh();

        // Gọi revalidate để cập nhật lại dữ liệu từ server
        if (revalidate) {
          revalidate();
        }

        // optional: also notify calendar clients
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('task:created', { detail: mapped }));
        }
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }

    setIsAddingTask(false);
    setNewTaskName('');
    setNewTaskDueDate('');
    setNewTaskProject('');
    setNewTaskStatus('TODO');
    setEnhancedDateData({});
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
    setNewTaskName('');
    setNewTaskDueDate('');
    setNewTaskProject('');
    setNewTaskStatus('TODO');
    setEnhancedDateData({});
  };

  const isAllSelected = section.tasks.length > 0 && section.tasks.every(task => selectedTasks.includes(task.id));

  return (
    <div className={`mb-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 py-2">
        <button
          onClick={handleToggleCollapse}
          className="flex items-center gap-2 text-sm font-semibold transition-colors group"
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
                <ChevronRight className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </>
          )}
          <span className="text-base font-medium">{section.title}</span>
          <span 
            className="ml-2 px-2 py-1 text-xs font-normal rounded-full"
            style={{ 
              backgroundColor: theme.background.secondary,
              color: theme.text.secondary 
            }}
          >
            {section.tasks.length}
          </span>
        </button>
        <div className="flex items-center gap-2"></div>
      </div>

      {!isCollapsed && (
        <div className="space-y-0">
          {tasks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {tasks.map((task) => (
                    <EnhancedTaskRow
                      key={task.id}
                      task={task}
                      actions={actions}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={onSelectTask}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add task row */}
          <div className="border-l-2 border-transparent hover:border-l-blue-400 transition-colors">
            <table className="w-full">
              <tbody>
                <tr className="group">
                  {/* Task Name */}
                  <td className="flex-1 min-w-[300px] py-3 px-2">
                    {isAddingTask ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-3 h-3 border border-gray-400 rounded"></div>
                        </div>
                        <input
                          type="text"
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="flex-1 text-sm bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                          style={{ color: theme.text.primary }}
                          placeholder="Task name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTask();
                            } else if (e.key === 'Escape') {
                              handleCancelAdd();
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 cursor-pointer py-2 px-2 rounded transition-colors hover:bg-gray-50"
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
                      <div className="flex items-center gap-1 px-2 py-1">
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
                          value={newTaskProject}
                          onChange={(e) => setNewTaskProject(e.target.value)}
                          className="flex-1 text-xs bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                          style={{ color: theme.text.primary }}
                          placeholder="Project name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTask();
                            } else if (e.key === 'Escape') {
                              handleCancelAdd();
                            }
                          }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="w-[140px] py-3 px-2">
                    {isAddingTask && (
                      <select
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                        className="text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTaskSection;
