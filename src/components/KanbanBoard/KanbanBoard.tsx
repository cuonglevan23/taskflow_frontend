"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { TaskListItem, TaskStatus, TaskListActions } from "@/components/TaskList/types";
import { formatTaskDate } from "@/components/TaskList/utils";
import { Plus, MoreHorizontal } from "lucide-react";
import { EnhancedCalendar } from "@/components/EnhancedCalendar";
import TaskListHeader from "@/components/TaskList/TaskListHeader";
import AddTaskModal from "./AddTaskModal";
import EmptySearchState from "@/components/ui/EmptySearchState";

interface KanbanBoardProps {
  tasks: TaskListItem[];
  tasksByAssignmentDate: Record<string, TaskListItem[]>;
  actions?: TaskListActions;
  onTaskMove?: (taskId: string, sectionId: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  searchValue?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  count: number;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  tasksByAssignmentDate,
  actions,
  onTaskMove,
  loading = false,
  error,
  className = "",
  searchValue: externalSearchValue = "",
}) => {
  const { theme } = useTheme();
  const [draggedTask, setDraggedTask] = useState<TaskListItem | null>(null);
  const [isEnhancedCalendarOpen, setIsEnhancedCalendarOpen] = useState(false);
  const [newTaskSection, setNewTaskSection] = useState<string>("recently-assigned");
  const [searchValue, setSearchValue] = useState(externalSearchValue);

  // Update search value when external prop changes
  React.useEffect(() => {
    setSearchValue(externalSearchValue);
  }, [externalSearchValue]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");

  // Filter tasks based on search
  const filteredTasksByAssignmentDate = React.useMemo(() => {
    if (!searchValue.trim()) return tasksByAssignmentDate;
    
    const filtered: Record<string, TaskListItem[]> = {};
    Object.keys(tasksByAssignmentDate).forEach(key => {
      const tasks = tasksByAssignmentDate[key] || [];
      filtered[key] = tasks.filter(task => 
        task.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.project?.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    return filtered;
  }, [tasksByAssignmentDate, searchValue]);

  // Check if search has results
  const hasSearchResults = React.useMemo(() => {
    if (!searchValue.trim()) return true;
    return Object.values(filteredTasksByAssignmentDate).some(tasks => tasks.length > 0);
  }, [filteredTasksByAssignmentDate, searchValue]);

  // Column definitions based on assignment date groups
  const columns: KanbanColumn[] = [
    {
      id: "recently-assigned",
      title: "Recently assigned",
      color: "#6B7280",
      count: filteredTasksByAssignmentDate["recently-assigned"]?.length || 0,
    },
    {
      id: "do-today",
      title: "Do today",
      color: "#DC2626",
      count: filteredTasksByAssignmentDate["do-today"]?.length || 0,
    },
    {
      id: "do-next-week",
      title: "Do next week",
      color: "#F59E0B",
      count: filteredTasksByAssignmentDate["do-next-week"]?.length || 0,
    },
    {
      id: "do-later",
      title: "Do later",
      color: "#10B981",
      count: filteredTasksByAssignmentDate["do-later"]?.length || 0,
    },
  ];

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: TaskListItem) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskMove?.(draggedTask.id, sectionId);
    }
    setDraggedTask(null);
  };

  const handleAddTask = (sectionId: string) => {
    setNewTaskSection(sectionId);
    setEditingTask(`new-${sectionId}`);
    setNewTaskName("");
  };

  const handleSaveNewTask = () => {
    if (!newTaskName.trim()) return;
    
    // Create task with appropriate due date based on section
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const later = new Date(today);
    later.setDate(today.getDate() + 14);

    let dueDate: string | undefined;
    
    switch (newTaskSection) {
      case 'do-today':
        dueDate = today.toISOString().split('T')[0];
        break;
      case 'do-next-week':
        dueDate = nextWeek.toISOString().split('T')[0];
        break;
      case 'do-later':
        dueDate = later.toISOString().split('T')[0];
        break;
      // 'recently-assigned' gets no default due date
    }

    const taskData = {
      name: newTaskName.trim(),
      dueDate,
      project: '',
      status: 'todo' as const
    };
    
    actions?.onCreateTask?.(taskData);
    setEditingTask(null);
    setNewTaskName("");
  };

  const handleCancelNewTask = () => {
    setEditingTask(null);
    setNewTaskName("");
  };

  const handleEnhancedCalendarSave = (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    repeatType: string;
    repeatDays: string[];
  }) => {
    // Convert dd/mm/yy format to proper date
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('/');
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const startDateFormatted = parseDate(data.startDate);
    const endDateFormatted = parseDate(data.endDate);
    
    // Determine appropriate due date and status based on section
    let defaultDueDate = startDateFormatted;
    let taskStatus: TaskStatus = 'todo';
    
    if (!defaultDueDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const later = new Date(today);
      later.setDate(today.getDate() + 14);

      switch (newTaskSection) {
        case 'do-today':
          defaultDueDate = today.toISOString().split('T')[0];
          break;
        case 'do-next-week':
          defaultDueDate = nextWeek.toISOString().split('T')[0];
          break;
        case 'do-later':
          defaultDueDate = later.toISOString().split('T')[0];
          break;
        // 'recently-assigned' gets no default due date
      }
    }

    // Create enhanced task data
    const enhancedTaskData = {
      name: 'New Task',
      dueDate: defaultDueDate,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      startTime: data.startTime,
      endTime: data.endTime,
      hasStartTime: !!data.startTime,
      hasEndTime: !!data.endTime,
      project: '',
      status: taskStatus
    };
    
    actions?.onCreateTask?.(enhancedTaskData);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    setNewTaskSection("recently-assigned");
    setEditingTask("new-recently-assigned");
    setNewTaskName("");
  };

  const handleClearSearch = () => {
    setSearchValue("");
  };

  // Task Card Component
  const TaskCard: React.FC<{ task: TaskListItem }> = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => actions?.onTaskClick?.(task)}
      className="p-3 mb-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        border: `1px solid ${theme.border.default}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          className="text-sm font-medium line-clamp-2"
          style={{ color: theme.text.primary }}
        >
          {task.name}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal 
            className="w-4 h-4" 
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>
      
      {task.description && (
        <p 
          className="text-xs mb-2 line-clamp-2"
          style={{ color: theme.text.secondary }}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: theme.background.secondary,
                color: theme.text.secondary 
              }}
            >
              {formatTaskDate(task)}
            </span>
          )}
          
          {task.priority && (
            <span 
              className={`px-2 py-1 rounded text-white ${
                task.priority === 'urgent' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-orange-500' :
                task.priority === 'medium' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: theme.colors?.primary || '#3B82F6' }}
                title={assignee.name}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
              >
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span style={{ color: theme.text.secondary }}>Loading board...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
            Something went wrong
          </h3>
          <p style={{ color: theme.text.secondary }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-full ${className}`}
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Board Content - No header, it's now in layout */}
      {!hasSearchResults && searchValue.trim() ? (
        <EmptySearchState
          searchQuery={searchValue}
          onClearSearch={handleClearSearch}
          onAdvancedSearch={() => {/* Handle advanced search */}}
        />
      ) : (
        <div className="flex gap-6 h-full overflow-x-auto overflow-y-hidden p-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 flex flex-col h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 
                    className="font-semibold"
                    style={{ color: theme.text.primary }}
                  >
                    {column.title}
                  </h3>
                  <span 
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ 
                      backgroundColor: theme.background.secondary,
                      color: theme.text.secondary 
                    }}
                  >
                    {column.count}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddTask(column.id)}
                  className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                  style={{ color: theme.text.secondary }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Content - Individual scroll */}
              <div 
                className="flex-1 p-2 rounded-lg min-h-[200px] group overflow-y-auto"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  border: `2px dashed ${theme.border.default}`,
                  maxHeight: 'calc(100vh - 280px)'
                }}
              >
                {/* New Task Input (when adding) */}
                {editingTask === `new-${column.id}` && (
                  <div
                    className="p-3 mb-2 rounded-lg border transition-all"
                    style={{
                      backgroundColor: theme.background.primary,
                      borderColor: theme.border.default,
                      border: `1px solid ${theme.border.default}`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-shrink-0 mt-1">
                        <div 
                          className="w-4 h-4 rounded border-2"
                          style={{ borderColor: theme.text.secondary }}
                        />
                      </div>
                      
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveNewTask();
                          } else if (e.key === 'Escape') {
                            handleCancelNewTask();
                          }
                        }}
                        onBlur={handleSaveNewTask}
                        placeholder="Write a task name"
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                        style={{ color: theme.text.primary }}
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Existing Tasks */}
                {filteredTasksByAssignmentDate[column.id]?.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                {/* Empty State */}
                {(!filteredTasksByAssignmentDate[column.id] || filteredTasksByAssignmentDate[column.id].length === 0) && editingTask !== `new-${column.id}` && (
                  <div 
                    className="flex items-center justify-center h-32 text-sm opacity-50"
                    style={{ color: theme.text.secondary }}
                  >
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Calendar Modal */}
      <EnhancedCalendar
        isOpen={isEnhancedCalendarOpen}
        onClose={() => setIsEnhancedCalendarOpen(false)}
        onSave={handleEnhancedCalendarSave}
      />
    </div>
  );
};

export default KanbanBoard;