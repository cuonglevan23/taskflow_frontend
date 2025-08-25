// Kiểu dữ liệu cho User Profile
export interface UserProfileDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  jobTitle?: string;
  department?: string;
  aboutMe?: string;
  status?: string;
  avatarUrl?: string;
  isUpgraded?: boolean;
  displayName: string;
  initials: string;
}

// Kiểu dữ liệu cho Team Progress
export interface TeamProgressResponseDto {
  id: number;
  teamId: number;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  teamOwner?: UserProfileDto;
  teamMembers?: UserProfileDto[];
  lastUpdatedBy?: UserProfileDto;
}

// Kiểu dữ liệu cho Team-Project Progress
export interface TeamProjectProgressResponseDto {
  id: number;
  teamId: number;
  teamName: string;
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  teamMembersInProject?: UserProfileDto[];
  lastUpdatedBy?: UserProfileDto;
}

// Kiểu dữ liệu cho Project Progress
export interface ProjectProgressResponseDto {
  id: number;
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  totalTeams: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  teamProjectProgressList?: TeamProjectProgressResponseDto[];
  projectCreator?: UserProfileDto;
  projectMembers?: UserProfileDto[];
  lastUpdatedBy?: UserProfileDto;
}
