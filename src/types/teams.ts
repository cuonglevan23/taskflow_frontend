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
  currentUserRole?: string;            // Current user's role in this team
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
  role?: string;                       // Optional, default: 'MEMBER' - allow any role from backend
}

export interface AddMemberRequestDto {
  userId: number;                      // Required, ID của user
  role?: string;                       // Optional, default: 'MEMBER' - allow any role from backend
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
  currentUserRole?: string;            // Current user's role in this team
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
  userId?: number;                     // User ID reference
  email: string;
  name?: string;
  role: string;                        // Allow any role string from backend
  joinedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  // Profile information fields
  department?: string;                 // User's department
  jobTitle?: string;                   // User's job title/position
  avatar?: string;                     // Avatar/profile image URL
  aboutMe?: string;                    // User bio/description
}

export interface TeamInvitation {
  id: number;
  teamId: number;
  email: string;
  role: string; // Allow any role string from backend
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