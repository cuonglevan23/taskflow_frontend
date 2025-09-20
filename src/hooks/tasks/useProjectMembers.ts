import { useState, useEffect, useCallback } from 'react';
import { projectMembersService, ProjectMemberDto, AvailableAssigneeDto } from '@/services/projects/projectMembersService';

export const useProjectMembers = (projectId: number | null) => {
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await projectMembersService.getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project members';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers
  };
};

export const useAvailableAssignees = (taskId: number | null) => {
  const [assignees, setAssignees] = useState<AvailableAssigneeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignees = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await projectMembersService.getAvailableAssignees(taskId);
      setAssignees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available assignees');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const refetchAssignees = useCallback(() => {
    fetchAssignees();
  }, [fetchAssignees]);

  return {
    assignees,
    loading,
    error,
    refetch: refetchAssignees,
    fetchAssignees: refetchAssignees
  };
};
