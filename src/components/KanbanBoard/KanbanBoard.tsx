"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { TaskListItem, TaskStatus, TaskListActions } from "@/components/TaskList/types";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { EnhancedCalendar } from "@/components/EnhancedCalendar";
import EmptySearchState from "@/components/ui/EmptySearchState";
import DragAndDropContext from "./DragAndDropContext";
import DroppableColumn from "./DroppableColumn";

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
  const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);
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

  // Professional Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Handle dragging over different columns
    if (activeId !== overId) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overData = over.data.current;
      
      if (activeTask && overData?.type === 'column') {
        // Optional: Implement optimistic updates here for smooth UX
        console.log(`Moving task ${activeTask.name} over column ${overData.columnId}`);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    const overData = over.data.current;
    
    // Handle dropping on a column
    if (overData?.type === 'column') {
      const task = tasks.find(t => t.id === activeId);
      if (task) {
        onTaskMove?.(task.id, overData.columnId);
      }
    }
    
    // Handle reordering within the same column
    if (activeId !== overId) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask && overTask) {
        // Find which column both tasks belong to
        const activeColumn = Object.keys(filteredTasksByAssignmentDate).find(
          key => filteredTasksByAssignmentDate[key].some(t => t.id === activeId)
        );
        const overColumn = Object.keys(filteredTasksByAssignmentDate).find(
          key => filteredTasksByAssignmentDate[key].some(t => t.id === overId)
        );
        
        if (activeColumn === overColumn) {
          // Same column reordering - could implement position updates here
          console.log(`Reordering task ${activeTask.name} in column ${activeColumn}`);
        } else if (overColumn) {
          // Moving to different column
          onTaskMove?.(activeTask.id, overColumn);
        }
      }
    }
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

  // Handle task click
  const handleTaskClick = (task: TaskListItem) => {
    actions?.onTaskClick?.(task);
  };

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
      {/* Board Content - Professional Drag and Drop */}
      {!hasSearchResults && searchValue.trim() ? (
        <EmptySearchState
          searchQuery={searchValue}
          onClearSearch={handleClearSearch}
          onAdvancedSearch={() => {/* Handle advanced search */}}
        />
      ) : (
        <DragAndDropContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          activeTask={activeTask}
        >
          <div className="flex gap-6 h-full overflow-x-auto overflow-y-hidden p-6">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={filteredTasksByAssignmentDate[column.id] || []}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
                isAddingTask={editingTask === `new-${column.id}`}
                newTaskInput={
                  editingTask === `new-${column.id}` ? (
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
                  ) : undefined
                }
              />
            ))}
          </div>
        </DragAndDropContext>
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