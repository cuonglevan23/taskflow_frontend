// Teams Service - Centralized team operations
// Uses BaseApiClient for consistent API handling with proper error management
import { BaseApiClient } from '@/lib/baseApiClient';
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

// Backend member response type
interface BackendMemberResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  joinedAt?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    department?: string;
    jobTitle?: string;
    avatar?: string;
    avatarUrl?: string;
  };
}

// Backend paginated response type
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

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

      // Use BaseApiClient for consistent error handling and authentication
      const responseData = await BaseApiClient.get<PaginatedResponse<TeamResponseDto> | TeamResponseDto[]>('/api/users/me/teams', {
        page,
        size,
        q: search
      });

      // Handle both paginated and simple array responses
      if (responseData && typeof responseData === 'object' && 'content' in responseData && Array.isArray(responseData.content)) {
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
      const responseData = await BaseApiClient.get<TeamResponseDto>(`/api/teams/${id}`);
      return transformTeamResponse(responseData);
    } catch (error) {
      console.error('❌ Failed to fetch team:', error);
      throw error;
    }
  },

  // Create team (simple - just name and description)
  createTeam: async (formData: CreateTeamFormData): Promise<Team> => {
    try {
      // Prepare request data according to TEAM_CREATION_UPDATE.md
      // Don't send leader_id - let backend use current user from JWT automatically
      const requestData: CreateTeamRequestDto = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        // leader_id omitted - backend will use current user from JWT as leader
        // project_id omitted - not needed for basic team creation
      };

      // Use BaseApiClient for consistent error handling and authentication
      const teamData = await BaseApiClient.post<TeamResponseDto>('/api/teams', requestData);

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

      const responseData = await BaseApiClient.put<TeamResponseDto>(`/api/teams/${id}`, requestData);
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid team data received from server');
      }
      return transformTeamResponse(responseData);
    } catch (error) {
      console.error('❌ Failed to update team:', error);
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (id: number): Promise<void> => {
    try {
      await BaseApiClient.delete<void>(`/api/teams/${id}`);
    } catch (error) {
      console.error('❌ Failed to delete team:', error);
      throw error;
    }
  },

  // ===== MEMBER MANAGEMENT =====

  // Invite member by email (POST /api/teams/{id}/invitations)
  inviteMemberByEmail: async (teamId: number, invitation: TeamInvitationRequestDto): Promise<void> => {
    try {
      await BaseApiClient.post<void>(`/api/teams/${teamId}/invitations`, invitation);
    } catch (error) {
      console.error('❌ Failed to invite member:', error);
      throw error;
    }
  },

  // Add member to team by email (POST /api/teams/{id}/members)
  addMemberByEmail: async (teamId: number, memberData: { email: string }): Promise<void> => {
    try {
      await BaseApiClient.post<void>(`/api/teams/${teamId}/members`, memberData);
    } catch (error) {
      console.error('❌ Failed to add member by email:', error);
      throw error;
    }
  },

  // Add existing user to team by ID (POST /api/teams/{id}/members)
  addMemberById: async (teamId: number, memberData: AddMemberRequestDto): Promise<void> => {
    try {
      await BaseApiClient.post<void>(`/api/teams/${teamId}/members`, memberData);
    } catch (error) {
      console.error('❌ Failed to add member by ID:', error);
      throw error;
    }
  },

  // Remove member from team (DELETE /api/teams/{id}/members/{memberId})
  removeMember: async (teamId: number, memberId: number): Promise<void> => {
    try {
      await BaseApiClient.delete<void>(`/api/teams/${teamId}/members/${memberId}`);
    } catch (error) {
      console.error('❌ Failed to remove member:', error);
      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('Cannot remove the only owner')) {
          throw new Error('Cannot remove the only owner of the team. Please assign another owner first.');
        }
        if (errorMessage.includes('Access denied') || errorMessage.includes('permission')) {
          throw new Error('You do not have permission to remove this member. Only ADMIN, OWNER, or the member themselves can perform this action.');
        }
      }
      throw error;
    }
  },

  // Get team members
  getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
    try {
      const responseData = await BaseApiClient.get<BackendMemberResponse[]>(`/api/teams/${teamId}/members`);

      if (!responseData || !Array.isArray(responseData)) {
        console.error('Invalid response format from API:', responseData);
        return [];
      }
      
      // Transform the API response to match the TeamMember type
      return responseData.map((member: BackendMemberResponse): TeamMember => {
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
          : userInfo.firstName || userInfo.lastName || userInfo.email || 'Unknown User';

        return {
          id: user.id || member.id,
          name: name,
          email: userInfo.email,
          role: member.role || 'MEMBER',
          status: 'ACTIVE', // Default status since backend doesn't provide it
          joinedAt: member.joinedAt || new Date().toISOString(),
          avatar: userInfo.avatar,
          department: userInfo.department,
          jobTitle: userInfo.jobTitle,
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch team members:', error);
      return []; // Return empty array instead of throwing to prevent UI crashes
    }
  },

  // ===== API INTEGRATION GUIDE METHODS =====

  // Get current user's teams (main method from API guide)
  getMyTeams: async (): Promise<TeamResponseDto[]> => {
    try {
      const responseData = await BaseApiClient.get<TeamResponseDto[]>('/api/users/me/teams');
      return responseData;
    } catch (error) {
      console.error('❌ Failed to fetch my teams:', error);
      throw error;
    }
  },

  // Get other user's teams (Admin/Owner only)
  getUserTeams: async (userId: number): Promise<TeamResponseDto[]> => {
    try {
      const responseData = await BaseApiClient.get<TeamResponseDto[]>(`/api/users/${userId}/teams`);
      return responseData;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error &&
          typeof error.message === 'string' && error.message.includes('Access denied')) {
        throw new Error('Access denied: You can only view your own teams or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user teams:', error);
      throw error;
    }
  },

  // Get teams created by specific user (Admin/Owner only)
  getUserCreatedTeams: async (userId: number): Promise<TeamResponseDto[]> => {
    try {
      const responseData = await BaseApiClient.get<TeamResponseDto[]>(`/api/users/${userId}/teams/created`);
      return responseData;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error &&
          typeof error.message === 'string' && error.message.includes('Access denied')) {
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