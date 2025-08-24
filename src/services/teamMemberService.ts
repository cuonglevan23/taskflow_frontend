import { api } from '@/lib/api';

/* ===================== Types ===================== */
export interface TeamMemberInviteRequest {
  teamId: number;
  userEmail: string;
}

export interface TeamMemberInviteResponse {
  id: number;
  teamId: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  joinedAt: string;
}

export interface TeamMemberRemoveRequest {
  teamId: number;
  memberId: number;
}

/* ===================== Team Member Service ===================== */
export class TeamMemberService {
  /**
   * Add a user to a team by email
   * POST /api/team-members
   */
  static async inviteMember(request: TeamMemberInviteRequest): Promise<TeamMemberInviteResponse> {
    try {
      console.log('🔄 Sending invite request:', { teamId: request.teamId, userEmail: request.userEmail });
      
      const response = await api.post<TeamMemberInviteResponse>('/api/team-members', {
        teamId: request.teamId,
        userEmail: request.userEmail
      });
      
      console.log('✅ Invite response received:', response);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Failed to invite team member:');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      // Handle specific error cases
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error('Axios error response:', axiosError?.response);
      console.error('Axios error response data:', axiosError?.response?.data);
      console.error('Axios error response status:', axiosError?.response?.status);
      
      if (axiosError?.response?.status === 501) {
        console.error('🚧 Backend endpoint not implemented yet');
        const errorData = axiosError?.response?.data as { details?: string; expectedEndpoint?: string } | undefined;
        console.error('💡 Details:', errorData?.details);
        console.error('🔗 Expected endpoint:', errorData?.expectedEndpoint);
        
        // Throw a more user-friendly error
        const friendlyError = new Error('Team invitation feature is not yet available. The backend API is still being developed.') as Error & { isNotImplemented: boolean };
        friendlyError.isNotImplemented = true;
        throw friendlyError;
      }
      
      throw error;
    }
  }

  /**
   * Remove a member from a team
   * DELETE /api/team-members?memberId={memberId}&teamId={teamId}
   */
  static async removeMember(request: TeamMemberRemoveRequest): Promise<void> {
    try {
      await api.delete(`/api/team-members?memberId=${request.memberId}&teamId=${request.teamId}`);
    } catch (error) {
      console.error('❌ Failed to remove team member:', error);
      throw error;
    }
  }

  /**
   * Bulk invite multiple members to a team
   */
  static async inviteMultipleMembers(
    teamId: number, 
    emails: string[]
  ): Promise<{
    successful: Array<{ email: string; data: TeamMemberInviteResponse }>;
    failed: Array<{ email: string; error: string }>;
  }> {
    const successful: Array<{ email: string; data: TeamMemberInviteResponse }> = [];
    const failed: Array<{ email: string; error: string }> = [];

    for (const email of emails) {
      try {
        const result = await this.inviteMember({ teamId, userEmail: email });
        successful.push({ email, data: result });
        console.log(`✅ Successfully invited ${email}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({ email, error: errorMessage });
        console.error(`❌ Failed to invite ${email}:`, errorMessage);
      }
    }

    return { successful, failed };
  }
}

/* ===================== Exports ===================== */
export default TeamMemberService;
