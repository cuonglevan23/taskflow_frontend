import { BaseApiClient } from '@/lib/baseApiClient';

export interface ProjectMemberDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  exists: boolean;
  isOnline: boolean;
}

export interface AvailableAssigneeDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  exists: boolean;
  isOnline: boolean;
}

class ProjectMembersService {
  /**
   * Get all members of a project
   */
  async getProjectMembers(projectId: number): Promise<ProjectMemberDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectMemberDto[]>(`/api/project-tasks/project/${projectId}/members`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available assignees for a specific task
   */
  async getAvailableAssignees(taskId: number): Promise<AvailableAssigneeDto[]> {
    try {
      return await BaseApiClient.get<AvailableAssigneeDto[]>(`/api/project-tasks/${taskId}/available-assignees`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update project task assignees
   */
  async updateProjectTaskAssignees(taskId: number, assigneeId: number | null, additionalAssigneeIds: number[]): Promise<void> {
    try {
      const updateData = {
        assigneeId,
        additionalAssigneeIds
      };

      const response = await BaseApiClient.put(`/api/project-tasks/${taskId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const projectMembersService = new ProjectMembersService();
