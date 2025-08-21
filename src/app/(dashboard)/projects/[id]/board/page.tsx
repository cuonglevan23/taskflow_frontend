"use client";

import React from 'react';
import { KanbanBoard } from '@/components/features/KanbanBoard';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { useProject } from '../components/DynamicProjectProvider';
import { 
  useProjectTasksByProject, 
  useProjectTaskActions 
} from '@/hooks/tasks/useProjectTasks';
import { useTheme } from '@/layouts/hooks/useTheme';
import type { 
  ProjectTaskResponseDto,
  CreateProjectTaskRequest 
} from '@/services/tasks/projectTaskService';

interface ProjectBoardPageProps {
  searchValue?: string;
}

function ProjectBoardContent({ searchValue = "" }: ProjectBoardPageProps) {
  const { theme } = useTheme();
  const { project } = useProject();
  const projectId = project?.id ? Number(project.id) : null;
  
  // Use API hooks instead of context
  const { 
    tasks: projectTasks, 
    loading, 
    error,
    revalidate 
  } = useProjectTasksByProject(projectId || 0, 0, 100);
  
  const {
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    loading: actionLoading
  } = useProjectTaskActions();
  
  // Local state for task detail panel
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  // Convert API tasks to KanbanBoard format
  const tasks = React.useMemo(() => {
    if (!projectTasks || !Array.isArray(projectTasks)) return [];
    
    return projectTasks.map((task: ProjectTaskResponseDto) => ({
      id: task.id.toString(),
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignees: [
        ...(task.assigneeName ? [{
          id: task.assigneeId?.toString() || '',
          name: task.assigneeName,
          email: task.assigneeEmail || '',
        }] : []),
        ...(task.additionalAssignees || []).map(assignee => ({
          id: assignee.id.toString(),
          name: assignee.name,
          email: assignee.email,
        }))
      ],
      deadline: task.deadline,
      startDate: task.startDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.projectName || project?.name || '',
      progressPercentage: task.progressPercentage || 0,
    }));
  }, [projectTasks, project?.name]);

  // Group tasks by assignment date for board display
  const tasksByAssignmentDate = React.useMemo(() => {
    // Simple grouping by status for now
    const grouped = tasks.reduce((acc, task) => {
      const status = task.status || 'TODO';
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<string, any[]>);
    return grouped;
  }, [tasks]);

  const handleTaskSave = async (taskId: string, updates: Partial<any>) => {
    try {
      await updateTask(Number(taskId), updates);
      setIsPanelOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(Number(taskId));
      setIsPanelOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskMove = async (taskId: string, sectionId: string) => {
    try {
      // Map sectionId to status
      const statusMapping: { [key: string]: string } = {
        'backlog': 'TODO',
        'todo': 'TODO', 
        'in-progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'done': 'DONE',
        'blocked': 'BLOCKED',
        'testing': 'TESTING'
      };
      
      const newStatus = statusMapping[sectionId] || sectionId;
      await updateTaskStatus(Number(taskId), newStatus);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const closeTaskPanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  };

  // Board actions for KanbanBoard
  const boardActions = {
    onCreateTask: async (taskData: any) => {
      try {
        if (!projectId) return;
        
        const createTaskRequest: CreateProjectTaskRequest = {
          title: taskData.title || taskData.name || 'New Task',
          description: taskData.description || '',
          projectId: projectId,
          status: taskData.status as any || 'TODO',
          priority: taskData.priority as any || 'MEDIUM',
          startDate: taskData.startDate,
          deadline: taskData.deadline,
          progressPercentage: 0,
        };
        
        await createTask(createTaskRequest);
        revalidate();
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    },
    onTaskClick: (task: any) => {
      setSelectedTask(task);
      setIsPanelOpen(true);
    }
  };

  // Show development notice for API issues (non-blocking)
  const showDevelopmentNotice = tasks.length === 0 && !loading && !error;

  if (error && !error.includes('404')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            {error}
          </div>
          <p className="text-gray-600">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
      {/* Development Notice */}

      
      {/* Kanban Board */}
      <div className="h-[calc(100%-80px)]">
        <KanbanBoard
          tasks={tasks}
          tasksByAssignmentDate={tasksByAssignmentDate}
          actions={boardActions}
          onTaskMove={handleTaskMove}
          loading={loading}
          error={error && !error.includes('404') ? error : undefined}
          searchValue={searchValue}
          className="h-full"
        />
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </div>
  );
}

export default function ProjectBoardPage({ searchValue }: ProjectBoardPageProps) {
  return <ProjectBoardContent searchValue={searchValue} />;
}