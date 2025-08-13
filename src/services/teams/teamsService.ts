// Teams Service - Centralized team operations using lib/api.ts
import { api } from '@/lib/api';
import { transformTeam, transformPaginatedResponse } from '@/lib/transforms';

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  managerId: string | null;
  projectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamDTO {
  name: string;
  description?: string;
  color?: string;
  memberIds?: string[];
  managerId?: string;
}

export interface UpdateTeamDTO {
  name?: string;
  description?: string;
  color?: string;
  memberIds?: string[];
  managerId?: string;
}

// Teams Service
export const teamsService = {
  // Get all teams
  getTeams: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{
    teams: Team[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      const {
        page = 0,
        size = 20,
        search
      } = params || {};

      console.log('🔄 Fetching teams...');
      
      const response = await api.get('/api/teams', {
        params: { page, size, q: search }
      });

      // Handle both paginated and simple array responses
      if (response.data.content) {
        return transformPaginatedResponse(response.data, transformTeam);
      } else {
        // Simple array response
        const teams = response.data.map(transformTeam);
        return {
          teams,
          totalElements: teams.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: teams.length,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch teams:', error);
      throw error;
    }
  },

  // Get team by ID
  getTeam: async (id: string): Promise<Team> => {
    try {
      console.log('🔄 Fetching team by ID:', id);
      const response = await api.get(`/api/teams/${id}`);
      return transformTeam(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch team:', error);
      throw error;
    }
  },

  // Create team
  createTeam: async (data: CreateTeamDTO): Promise<Team> => {
    try {
      console.log('🔄 Creating team:', data.name);
      const response = await api.post('/api/teams', data);
      return transformTeam(response.data);
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      throw error;
    }
  },

  // Update team
  updateTeam: async (id: string, data: UpdateTeamDTO): Promise<Team> => {
    try {
      console.log('🔄 Updating team:', id);
      const response = await api.put(`/api/teams/${id}`, data);
      return transformTeam(response.data);
    } catch (error) {
      console.error('❌ Failed to update team:', error);
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (id: string): Promise<void> => {
    try {
      console.log('🔄 Deleting team:', id);
      await api.delete(`/api/teams/${id}`);
      console.log('✅ Successfully deleted team:', id);
    } catch (error) {
      console.error('❌ Failed to delete team:', error);
      throw error;
    }
  },

  // Add member to team
  addMember: async (teamId: string, userId: string): Promise<Team> => {
    try {
      console.log('🔄 Adding member to team:', teamId, userId);
      const response = await api.post(`/api/teams/${teamId}/members`, { userId });
      return transformTeam(response.data);
    } catch (error) {
      console.error('❌ Failed to add member to team:', error);
      throw error;
    }
  },

  // Remove member from team
  removeMember: async (teamId: string, userId: string): Promise<Team> => {
    try {
      console.log('🔄 Removing member from team:', teamId, userId);
      const response = await api.delete(`/api/teams/${teamId}/members/${userId}`);
      return transformTeam(response.data);
    } catch (error) {
      console.error('❌ Failed to remove member from team:', error);
      throw error;
    }
  },
};