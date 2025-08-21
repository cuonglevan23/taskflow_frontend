// Teams Service - Centralized team operations
// Uses fetch for Next.js API routes instead of external backend
import { api } from '@/lib/api';
import type {
  Team,
  TeamResponseDto,
  CreateTeamRequestDto,
  UpdateTeamRequestDto,
  TeamInvitationRequestDto,
  AddMemberRequestDto,
  CreateTeamFormData,
  UpdateTeamFormData,
  TeamsApiResponse,
  TeamMember,
  TeamQueryParams
} from '@/types/teams';

// Transform backend response to frontend type
const transformTeamResponse = (backendTeam: TeamResponseDto): Team => {
  return {
    id: backendTeam.id,
    name: backendTeam.name,
    description: backendTeam.description,
    leaderId: backendTeam.leaderId,
    createdById: backendTeam.createdById,
    isDefaultWorkspace: backendTeam.isDefaultWorkspace,
    organizationId: backendTeam.organizationId,
    createdAt: new Date(backendTeam.createdAt),
    updatedAt: new Date(backendTeam.updatedAt),
  };
};

// Teams Service with CRUD operations
export const teamsService = {
  // ===== BASIC CRUD OPERATIONS =====

  // Get all teams with pagination
  getTeams: async (params?: TeamQueryParams): Promise<TeamsApiResponse> => {
    try {
      const {
        page = 0,
        size = 20,
        search
      } = params || {};


      
      // Use api client to hit real backend with proper authentication
      const response = await api.get('/api/users/me/teams', {
        params: { page, size, q: search }
      });

      // Handle response data
      const responseData = response.data;
      
      // Handle both paginated and simple array responses
      if (responseData?.content && Array.isArray(responseData.content)) {
        // Paginated response
        const teams = responseData.content.map(transformTeamResponse);
        return {
          teams,
          totalElements: responseData.totalElements,
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          pageSize: responseData.size,
        };
      } else if (Array.isArray(responseData)) {
        // Simple array response
        const teams = responseData.map(transformTeamResponse);
        return {
          teams,
          totalElements: teams.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: teams.length,
        };
      } else {
        // Empty or invalid response
        return {
          teams: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch teams:', error);
      throw error;
    }
  },

  // Get team by ID
  getTeam: async (id: number): Promise<Team> => {
    try {

      const response = await api.get(`/api/teams/${id}`);
      return transformTeamResponse(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch team:', error);
      throw error;
    }
  },

  // Create team (simple - just name and description)
  createTeam: async (formData: CreateTeamFormData, userSession?: any): Promise<Team> => {
    try {
      // Prepare request data according to TEAM_CREATION_UPDATE.md
      // Don't send leader_id - let backend use current user from JWT automatically
      const requestData: CreateTeamRequestDto = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        // leader_id omitted - backend will use current user from JWT as leader
        // project_id omitted - not needed for basic team creation
      };

      // Use api client to hit real backend with proper authentication
      const response = await api.post('/api/teams', requestData);
      
      // Transform response - backend handles user IDs automatically
      const teamData = response.data;
      const newTeam: Team = {
        id: teamData.id,
        name: teamData.name,
        description: teamData.description || '',
        leaderId: teamData.leaderId,
        createdById: teamData.createdById,
        isDefaultWorkspace: teamData.isDefaultWorkspace || false,
        organizationId: teamData.organizationId || null,
        createdAt: new Date(teamData.createdAt || new Date()),
        updatedAt: new Date(teamData.updatedAt || new Date()),
      };
      
      // If member emails provided, invite them after team creation
      if (formData.memberEmails && formData.memberEmails.length > 0) {
        // Invite each member (fire and forget - don't block team creation)
        formData.memberEmails.forEach(async (email) => {
          try {
            await teamsService.inviteMemberByEmail(newTeam.id, { email });
          } catch (error) {
            console.warn('⚠️ Failed to invite member:', email, error);
          }
        });
      }
      
      return newTeam;
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      throw error;
    }
  },

  // Update team
  updateTeam: async (id: number, formData: UpdateTeamFormData): Promise<Team> => {
    try {

      
      const requestData: UpdateTeamRequestDto = {
        name: formData.name?.trim(),
        description: formData.description?.trim(),
      };

      const response = await api.put(`/api/teams/${id}`, requestData);
      return transformTeamResponse(response.data);
    } catch (error) {
      console.error('❌ Failed to update team:', error);
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (id: number): Promise<void> => {
    try {

      await api.delete(`/api/teams/${id}`);

    } catch (error) {
      console.error('❌ Failed to delete team:', error);
      throw error;
    }
  },

  // ===== MEMBER MANAGEMENT =====

  // Invite member by email
  inviteMemberByEmail: async (teamId: number, invitation: TeamInvitationRequestDto): Promise<void> => {
    try {

      await api.post(`/api/teams/${teamId}/invitations`, invitation);

    } catch (error) {
      console.error('❌ Failed to invite member:', error);
      throw error;
    }
  },

  // Add existing user to team by ID
  addMemberById: async (teamId: number, memberData: AddMemberRequestDto): Promise<void> => {
    try {

      await api.post(`/api/teams/${teamId}/members`, memberData);

    } catch (error) {
      console.error('❌ Failed to add member:', error);
      throw error;
    }
  },

  // Remove member from team
  removeMember: async (teamId: number, memberId: number): Promise<void> => {
    try {

      await api.delete(`/api/teams/${teamId}/members/${memberId}`);

    } catch (error) {
      console.error('❌ Failed to remove member:', error);
      throw error;
    }
  },

  // Get team members
  getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
    try {

      const response = await api.get(`/api/teams/${teamId}/members`);

      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch team members:', error);
      throw error;
    }
  },

  // ===== API INTEGRATION GUIDE METHODS =====

  // Get current user's teams (main method from API guide)
  getMyTeams: async (): Promise<TeamResponseDto[]> => {
    try {
      const response = await api.get('/api/users/me/teams');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch my teams:', error);
      throw error;
    }
  },

  // Get other user's teams (Admin/Owner only)
  getUserTeams: async (userId: number): Promise<TeamResponseDto[]> => {
    try {

      const response = await api.get(`/api/users/${userId}/teams`);

      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Access denied: You can only view your own teams or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user teams:', error);
      throw error;
    }
  },

  // Get teams created by specific user (Admin/Owner only)
  getUserCreatedTeams: async (userId: number): Promise<TeamResponseDto[]> => {
    try {

      const response = await api.get(`/api/users/${userId}/teams/created`);

      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Access denied: You can only view your own data or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user created teams:', error);
      throw error;
    }
  },

  // ===== HELPER METHODS =====

  // Search teams by name
  searchTeams: async (query: string): Promise<Team[]> => {
    try {
      const { teams } = await teamsService.getTeams({ search: query, size: 50 });
      return teams;
    } catch (error) {
      console.error('❌ Failed to search teams:', error);
      throw error;
    }
  },
};