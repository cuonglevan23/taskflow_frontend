// Custom hook for project task assignees management
import { useMemo } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import { useProjectMembers } from '@/hooks/tasks/useProjectMembers';

interface ProjectTaskAssignee {
  id: string;
  name: string;
  email: string;
  avatar?: string | undefined;
}

interface UseProjectTaskAssigneesProps {
  task: TaskListItem | null;
  projectId: number | null;
}

export const useProjectTaskAssignees = ({ task, projectId: propProjectId }: UseProjectTaskAssigneesProps) => {
  // Get project ID from task data for fetching members - FIXED VERSION
  const projectId = useMemo(() => {
    if (!task) return propProjectId || null;

    // Try multiple sources for project ID
    let id = task.projectId || task.project;

    // If still no ID, try to get from URL or context
    if (!id) {
      // Get from current URL path if available
      const urlProjectId = window.location.pathname.split('/projects/')[1]?.split('/')[0];
      if (urlProjectId && !isNaN(Number(urlProjectId))) {
        id = urlProjectId;
      }
    }

    // CRITICAL FIX: Convert to number for useProjectMembers hook
    return typeof id === 'string' && !isNaN(Number(id)) ? Number(id) :
           typeof id === 'number' ? id :
           // Fallback: extract from URL
           (() => {
             const urlProjectId = window.location.pathname.split('/projects/')[1]?.split('/')[0];
             return urlProjectId && !isNaN(Number(urlProjectId)) ? Number(urlProjectId) : null;
           })();
  }, [task, propProjectId]);

  // Use project members hook to get member data with avatars
  const { members, loading: membersLoading } = useProjectMembers(projectId || 0);

  // Compute assignees with correct avatar URLs - FIXED VERSION
  const computedAssignees = useMemo((): ProjectTaskAssignee[] => {
    if (!task) return [];

    // If we have both assignees and members data, merge them for avatars
    if (task.assignees && task.assignees.length > 0) {
      return task.assignees.map(assignee => {
        // Find member info to get avatar URL
        const memberInfo = members.find(m => m.userId === parseInt(assignee.id));

        return {
          id: assignee.id.toString(),
          name: assignee.name,
          email: assignee.email || '',
          avatar: memberInfo?.avatarUrl || assignee.avatarUrl || assignee.avatar || undefined
        };
      });
    }

    // FALLBACK: Use members data if available but no assignees
    if (members.length > 0) {
      const assignees = [];

      // Get primary assignee from task data using assigneeId and members list
      if (task.assigneeId) {
        const assigneeId = Number(task.assigneeId);
        const memberInfo = members.find(m => m.userId === assigneeId);

        if (memberInfo) {
          assignees.push({
            id: assigneeId.toString(),
            name: `${memberInfo.firstName} ${memberInfo.lastName}`.trim() || memberInfo.username || memberInfo.email,
            email: memberInfo.email,
            avatar: memberInfo.avatarUrl || undefined
          });
        }
      }

      // Get additional assignees
      const additionalAssignees = task.additionalAssignees || [];
      additionalAssignees.forEach((assignee: any) => {
        const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
        const memberInfo = members.find(m => m.userId === userId);

        if (memberInfo) {
          assignees.push({
            id: userId.toString(),
            name: `${memberInfo.firstName} ${memberInfo.lastName}`.trim() || memberInfo.username || memberInfo.email,
            email: memberInfo.email,
            avatar: memberInfo.avatarUrl || undefined
          });
        }
      });

      return assignees;
    }

    return [];
  }, [task, members]);

  return {
    computedAssignees,
    members,
    membersLoading,
  };
};
