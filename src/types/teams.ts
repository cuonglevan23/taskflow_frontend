// ===== Team Types - API & Frontend =====

// ===== API Response Types (from backend) =====
export interface TeamResponseDto {
  id: number;                          // Primary key, auto-generated
  name: string;                        // Required, max 255 chars
  description?: string | null;         // Optional, max 1000 chars
  leaderId?: number | null;            // FK to User.id, optional
  createdById?: number | null;         // FK to User.id who created team
  isDefaultWorkspace: boolean;         // Default: false
  organizationId?: number | null;      // FK to Organization.id, optional
  createdAt: string;                   // ISO 8601 datetime
  updatedAt: string;                   // ISO 8601 datetime
}

// ===== API Request Types (to backend) =====
export interface CreateTeamRequestDto {
  name: string;                        // Required, min 2 chars, max 255
  description?: string;                // Optional, max 1000 chars
  project_id?: number;                 // Optional FK to Project.id
  leader_id?: number;                  // Optional FK to User.id
}

export interface UpdateTeamRequestDto {
  name?: string;                       // Optional, min 2 chars, max 255
  description?: string;                // Optional, max 1000 chars
  leaderId?: number;                   // Optional FK to User.id
  projectId?: number;                  // Optional FK to Project.id
}

export interface TeamInvitationRequestDto {
  email: string;                       // Required, email của user được mời
  message?: string;                    // Optional, tin nhắn kèm theo (max 500 chars)
  role?: 'MEMBER' | 'LEADER';          // Optional, default: 'MEMBER'
}

export interface AddMemberRequestDto {
  userId: number;                      // Required, ID của user
  role?: 'MEMBER' | 'LEADER';          // Optional, default: 'MEMBER'
}

// ===== Frontend Types =====
export interface Team {
  id: number;
  name: string;
  description?: string | null;
  leaderId?: number | null;
  createdById?: number | null;
  isDefaultWorkspace: boolean;
  organizationId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;                // Computed field
}

// ===== Form Data Types =====
export interface CreateTeamFormData {
  name: string;
  description?: string;
  memberEmails?: string[];             // For inviting members during creation
}

export interface UpdateTeamFormData {
  name?: string;
  description?: string;
}

// ===== Team Member Types =====
export interface TeamMember {
  id: number;
  email: string;
  name?: string;
  role: 'MEMBER' | 'LEADER';
  joinedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface TeamInvitation {
  id: number;
  teamId: number;
  email: string;
  role: 'MEMBER' | 'LEADER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  invitedBy: number;
  invitedAt: string;
  message?: string;
}

// ===== Validation Types =====
export interface TeamValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
  description: {
    maxLength: number;
  };
  email: {
    pattern: RegExp;
    maxEmails: number;
  };
}

export interface TeamFormErrors {
  nameError?: string;
  emailError?: string;
  emailsError?: string;
  generalError?: string;
}

// ===== API Response Wrappers =====
export interface TeamsApiResponse {
  teams: Team[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TeamMembersApiResponse {
  members: TeamMember[];
  totalMembers: number;
}

export interface TeamInvitationsApiResponse {
  invitations: TeamInvitation[];
  totalInvitations: number;
}

// ===== Utility Types =====
export type TeamRole = 'MEMBER' | 'LEADER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

// ===== Query Parameters =====
export interface TeamQueryParams {
  page?: number;
  size?: number;
  search?: string;
  organizationId?: number;
  leaderId?: number;
  isDefaultWorkspace?: boolean;
}

export interface TeamMemberQueryParams {
  page?: number;
  size?: number;
  role?: TeamRole;
  status?: MemberStatus;
}