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
  if (!backendTeam) {
    throw new Error('Team data is required');
  }
  
  return {
    id: backendTeam.id,
    name: backendTeam.name || 'Unnamed Team',
    description: backendTeam.description || '',
    leaderId: backendTeam.leaderId,
    createdById: backendTeam.createdById,
    isDefaultWorkspace: backendTeam.isDefaultWorkspace || false,
    organizationId: backendTeam.organizationId,
    createdAt: backendTeam.createdAt ? new Date(backendTeam.createdAt) : new Date(),
    updatedAt: backendTeam.updatedAt ? new Date(backendTeam.updatedAt) : new Date(),
    // Handle currentUserRole from backend
    currentUserRole: backendTeam.currentUserRole || 'MEMBER',
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
      const teamData = response.data as TeamResponseDto;
      if (!teamData || typeof teamData !== 'object') {
        throw new Error('Invalid team data received from server');
      }
      
      const newTeam: Team = {
        id: teamData.id,
        name: teamData.name || 'Unnamed Team',
        description: teamData.description || '',
        leaderId: teamData.leaderId,
        createdById: teamData.createdById,
        isDefaultWorkspace: teamData.isDefaultWorkspace || false,
        organizationId: teamData.organizationId || null,
        createdAt: teamData.createdAt ? new Date(teamData.createdAt) : new Date(),
        updatedAt: teamData.updatedAt ? new Date(teamData.updatedAt) : new Date(),
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

      const response = await api.put<TeamResponseDto>(`/api/teams/${id}`, requestData);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid team data received from server');
      }
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
      console.log(`Fetching members for team ${teamId}...`);
      const response = await api.get(`/api/teams/${teamId}/members`);
      console.log('API Response:', response);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format from API:', response);
        return [];
      }
      
      // Transform the API response to match the TeamMember type
      return response.data.map((member: any) => {
        // Debug log to check full backend structure first
        console.log('🔍 Full backend member data:', member);
        
        // Extract user info - backend might have nested user object
        const user = member.user || member;
        const userInfo = {
          firstName: user.firstName || member.firstName,
          lastName: user.lastName || member.lastName,
          email: user.email || member.email,
          department: user.department || member.department,
          jobTitle: user.jobTitle || member.jobTitle,
          avatar: user.avatar || user.avatarUrl || member.avatar || member.avatarUrl
        };
        
        // Combine firstName and lastName if available
        const name = userInfo.firstName && userInfo.lastName 
          ? `${userInfo.firstName} ${userInfo.lastName}`.trim()
          : user.name || member.name || user.fullName || member.fullName || `User ${member.userId || member.id}`;
          
        return {
          id: member.id,
          userId: member.userId || user.id || member.id,
          name: name,
          email: userInfo.email || `user${member.userId || member.id}@example.com`,
          role: (member.role || 'MEMBER').toUpperCase(),
          status: (member.status || 'ACTIVE').toUpperCase() as 'ACTIVE' | 'PENDING' | 'INACTIVE',
          joinedAt: member.joinedAt || member.createdAt || new Date().toISOString(),
          department: userInfo.department || 'Not specified',
          aboutMe: user.aboutMe || member.aboutMe || '',
          jobTitle: userInfo.jobTitle || '',
          avatar: userInfo.avatar || ''
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch team members:', error);
      return [];
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
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 403) {
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
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 403) {
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
    } catch (error: unknown) {
      console.error('❌ Failed to search teams:', error);
      throw error;
    }
  },
};