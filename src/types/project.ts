// Project-related types
import { UserRole } from './roles';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date | string;
  endDate?: Date | string;
  dueDate?: Date | string;
  progress: number; // 0-100
  budget?: number;
  currency?: string;
  ownerId: string;
  teamId?: string;
  tags?: string[];
  color?: string;
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  updatedBy?: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date | string;
  endDate?: Date | string;
  dueDate?: Date | string;
  budget?: number;
  currency?: string;
  teamId?: string;
  tags?: string[];
  color?: string;
  isPublic?: boolean;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date | string;
  endDate?: Date | string;
  dueDate?: Date | string;
  progress?: number;
  budget?: number;
  currency?: string;
  teamId?: string;
  tags?: string[];
  color?: string;
  isPublic?: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date | string;
  permissions?: string[];
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeTasks: number;
  totalMembers: number;
  progress: number;
}