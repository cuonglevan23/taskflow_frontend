export interface TeamMemberDto {
  userId: number;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  jobTitle?: string;
  initials?: string;
}

export interface TeamProgressResponseDto {
  teamId: number;
  teamName: string;
  goalTitle?: string;
  timeframe?: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  lastUpdated?: string;
  teamOwner?: TeamMemberDto;
  teamMembers?: TeamMemberDto[];
  lastUpdatedBy?: TeamMemberDto;
}

export interface TeamListDto {
  teamId: number;
  teamName: string;
  description?: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated?: string;
  teamOwner?: TeamMemberDto;
}
