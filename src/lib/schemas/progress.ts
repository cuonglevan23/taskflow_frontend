import { z } from 'zod';

// User Profile Schema
export const UserProfileSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  aboutMe: z.string().optional(),
  status: z.string().optional(),
  avatarUrl: z.string().optional(),
  isUpgraded: z.boolean().optional(),
  displayName: z.string(),
  initials: z.string(),
});

// Team Progress Schema
export const TeamProgressSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  teamName: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionPercentage: z.number(),
  lastUpdated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  teamOwner: UserProfileSchema.optional(),
  teamMembers: z.array(UserProfileSchema).optional(),
  lastUpdatedBy: UserProfileSchema.optional(),
});

// Team Project Progress Schema
export const TeamProjectProgressSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  teamName: z.string(),
  projectId: z.number(),
  projectName: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionPercentage: z.number(),
  lastUpdated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  teamMembersInProject: z.array(UserProfileSchema).optional(),
  lastUpdatedBy: UserProfileSchema.optional(),
});

// Project Progress Schema
export const ProjectProgressSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  projectName: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionPercentage: z.number(),
  totalTeams: z.number(),
  lastUpdated: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  teamProjectProgressList: z.array(TeamProjectProgressSchema).optional(),
  projectCreator: UserProfileSchema.optional(),
  projectMembers: z.array(UserProfileSchema).optional(),
  lastUpdatedBy: UserProfileSchema.optional(),
});

// Export types derived from schemas
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type TeamProgress = z.infer<typeof TeamProgressSchema>;
export type TeamProjectProgress = z.infer<typeof TeamProjectProgressSchema>;
export type ProjectProgress = z.infer<typeof ProjectProgressSchema>;
