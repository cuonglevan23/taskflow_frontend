// Custom hook for calendar task data transformation and enhancement
import { useMemo } from 'react';
import { useProjectMembers } from '@/hooks/tasks/useProjectMembers';

interface UseCalendarTasksProps {
  tasks: any[];
  projectId?: string;
}

export const useCalendarTasks = ({ tasks, projectId }: UseCalendarTasksProps) => {
  // Fetch project members to get avatar URLs
  const numericProjectId = projectId ? Number(projectId) : 0;
  const { members } = useProjectMembers(numericProjectId);

  // Convert and enhance tasks for calendar display
  const calendarTasks = useMemo(() => {
    return tasks?.map(task => {
      // Enhance assignees with avatar URLs from members data
      let enhancedAssignees = task.assignees || [];

      if (members.length > 0 && enhancedAssignees.length > 0) {
        enhancedAssignees = enhancedAssignees.map((assignee: any) => {
          const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
          const memberInfo = members.find(m => m.userId === userId);

          return {
            ...assignee,
            avatar: memberInfo?.avatarUrl || assignee.avatar,
            avatarUrl: memberInfo?.avatarUrl || assignee.avatarUrl
          };
        });
      }

      // Preserve ALL task data - don't strip away assignee information
      const processedTask = {
        ...task, // Keep all TaskListItem fields
        assignees: enhancedAssignees, // Use enhanced assignees with avatar URLs
        title: task.title || task.name, // Ensure calendar has title field
        // Override only calendar-specific fields
        startDate: task.startDate,
        endDate: task.deadline || task.endDate,
        deadline: task.deadline,
        projectId: numericProjectId,
        color: task.color,
      };

      return processedTask;
    }) || [];
  }, [tasks, numericProjectId, members]);

  return {
    calendarTasks,
    members,
  };
};
