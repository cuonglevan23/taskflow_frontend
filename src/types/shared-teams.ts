// Shared team member types and utilities
// Used across both overview and members pages

import type { TeamMember as OriginalTeamMember } from '@/types/teams';

export interface SharedTeamMember {
  id: number;
  userId?: number;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  joinedAt: string;
  // Profile information
  department?: string;
  jobTitle?: string;
  avatar?: string;
  aboutMe?: string;
}

// For Members component (overview page)
export interface MembersViewData {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
  email?: string;
  role?: string;
}

// For MembersTable component (members page)
export interface MembersTableData {
  id: number;
  userId?: number;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  joinedAt: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  aboutMe?: string;
}

// Adapter function to convert from useTeam hook TeamMember to SharedTeamMember
export const adaptTeamMember = (member: OriginalTeamMember): SharedTeamMember => ({
  id: member.id,
  userId: member.userId || member.id,
  name: member.name || 'Unknown',
  email: member.email,
  role: member.role,
  status: member.status,
  joinedAt: member.joinedAt,
  department: member.department,
  jobTitle: member.jobTitle,
  avatar: member.avatar,
  aboutMe: member.aboutMe
});

// Transform utilities
export const transformMemberForMembersView = (member: SharedTeamMember): MembersViewData => ({
  id: member.id.toString(),
  name: member.name,
  avatarUrl: member.avatar,
  color: '#6B7280', // Default color
  email: member.email,
  role: member.role
});

export const transformMemberForMembersTable = (member: SharedTeamMember): MembersTableData => ({
  id: member.id,
  userId: member.userId || member.id,
  name: member.name,
  email: member.email,
  role: member.role,
  status: member.status,
  joinedAt: member.joinedAt,
  department: member.department,
  jobTitle: member.jobTitle,
  avatar: member.avatar,
  aboutMe: member.aboutMe
});

// Convenience functions that combine adapter + transform
export const transformTeamMemberForMembersView = (member: OriginalTeamMember): MembersViewData => 
  transformMemberForMembersView(adaptTeamMember(member));

export const transformTeamMemberForMembersTable = (member: OriginalTeamMember): MembersTableData => 
  transformMemberForMembersTable(adaptTeamMember(member));
