// Project Service - Project-related API operations
import { api } from './api';
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types';

export const projectService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  // Get project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: CreateProjectDTO): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectDTO): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Get project members
  getProjectMembers: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/projects/${id}/members`);
    return response.data;
  },

  // Add member to project
  addProjectMember: async (id: string, userId: string, role: string): Promise<void> => {
    await api.post(`/projects/${id}/members`, { userId, role });
  },

  // Remove member from project
  removeProjectMember: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/projects/${id}/members/${userId}`);
  },
};