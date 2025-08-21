"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProject } from '../../components/DynamicProjectProvider';
import { useProject as useProjectData } from '@/hooks/projects/useProjects';
import { teamsService } from '@/services/teams/teamsService';
import { projectsService } from '@/services/projects';
import useSWR, { mutate } from 'swr';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  dueDate?: Date;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface Portfolio {
  id: string;
  name: string;
  color: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED';
  owner: TeamMember;
}

interface StatusUpdate {
  id: string;
  type: 'status_update' | 'milestone' | 'activity';
  title: string;
  description: string;
  author: TeamMember;
  timestamp: Date;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED';
}

interface ProjectOverviewData {
  description: string;
  members: TeamMember[];
  goals: Goal[];
  portfolios: Portfolio[];
  statusUpdates: StatusUpdate[];
  projectStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED';
}

interface ProjectOverviewContextValue {
  data: ProjectOverviewData;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateDescription: (description: string) => Promise<void>;
  addMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  addStatusUpdate: (update: Omit<StatusUpdate, 'id' | 'timestamp'>) => Promise<void>;
  updateProjectStatus: (status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED') => Promise<void>;
}

const ProjectOverviewContext = createContext<ProjectOverviewContextValue | undefined>(undefined);

interface ProjectOverviewProviderProps {
  children: ReactNode;
}

// Mock data
const mockData: ProjectOverviewData = {
  description: "This is a sample projects description",
  projectStatus: 'IN_PROGRESS',
  members: [
    {
      id: '1',
      name: 'Vân Lê',
      role: 'Project owner',
      avatar: 'VL',
      email: 'van.le@company.com'
    }
  ],
  goals: [
    {
      id: '1',
      title: 'Complete projects setup',
      description: 'Set up projects infrastructure and team',
      progress: 100,
      status: 'completed'
    }
  ],
  portfolios: [
    {
      id: '1',
      name: 'My first portfolio',
      color: '#8b5cf6',
      status: 'IN_PROGRESS',
      owner: {
        id: '1',
        name: 'Vân Lê',
        role: 'Portfolio owner',
        avatar: 'VL'
      }
    }
  ],
  statusUpdates: [
    {
      id: '1',
      type: 'status_update',
      title: 'This projects is kicked off!',
      description: 'This is a sample projects status update in Asana. Use status updates to communicate the progress of your projects with your teammates.',
      author: {
        id: '1',
        name: 'Vân Lê',
        role: 'Project owner',
        avatar: 'VL'
      },
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      status: 'IN_PROGRESS'
    },
    {
      id: '2',
      type: 'activity',
      title: 'My workspace team joined',
      description: 'Team members were added to the projects',
      author: {
        id: '1',
        name: 'Vân Lê',
        role: 'Project owner',
        avatar: 'VL'
      },
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    }
  ]
};

export function ProjectOverviewProvider({ children }: ProjectOverviewProviderProps) {
  const { project } = useProject();
  const projectId = project?.id;
  
  // SWR hooks for real data fetching - Next.js 15 compliant
  const { data: projectData } = useProjectData(projectId ? Number(projectId) : null);
  const { data: teamMembers, mutate: mutateMembers } = useSWR(
    projectId ? `project-${projectId}-members` : null,
    async () => {
      if (!projectId) return [];
      // For now, use mock data structure until backend API is ready
      return mockData.members;
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for optimistic updates
  const [optimisticStatus, setOptimisticStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED' | null>(null);
  
  // Combine real and mock data - Next.js 15 pattern
  const data: ProjectOverviewData = {
    description: projectData?.description || project?.description || mockData.description,
    members: teamMembers || mockData.members,
    goals: mockData.goals, // Will be replaced with real API later
    portfolios: mockData.portfolios, // Will be replaced with real API later
    statusUpdates: mockData.statusUpdates, // Will be replaced with real API later
    projectStatus: optimisticStatus || (projectData?.status as any) || mockData.projectStatus,
  };

  // Actions - Real API integration
  const updateDescription = async (description: string) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      await projectsService.updateProject(Number(projectId), { description });
      // Revalidate project data
      await mutate(`project-${projectId}`);
    } catch (err) {
      setError('Failed to update description');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // For now, simulate API call - will be replaced with real project member API
      const newMember: TeamMember = {
        ...member,
        id: Date.now().toString()
      };
      
      // Optimistic update
      await mutateMembers([...data.members, newMember], false);
      
      // Here you would call real API:
      // await projectsService.addProjectMember(Number(projectId), member);
      
      // Revalidate members
      await mutateMembers();
    } catch (err) {
      setError('Failed to add member');
      // Rollback optimistic update
      await mutateMembers();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Optimistic update
      const updatedMembers = data.members.filter(m => m.id !== memberId);
      await mutateMembers(updatedMembers, false);
      
      // Here you would call real API:
      // await projectsService.removeProjectMember(Number(projectId), memberId);
      
      // Revalidate members
      await mutateMembers();
    } catch (err) {
      setError('Failed to remove member');
      // Rollback optimistic update
      await mutateMembers();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // TODO: Real API call when backend is ready
      // await projectsService.addProjectGoal(Number(projectId), goal);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Added goal:', goal.title);
    } catch (err) {
      setError('Failed to add goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // TODO: Real API call when backend is ready
      // await projectsService.updateProjectGoal(Number(projectId), goalId, updates);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Updated goal:', goalId, updates);
    } catch (err) {
      setError('Failed to update goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStatusUpdate = async (update: Omit<StatusUpdate, 'id' | 'timestamp'>) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // TODO: Real API call when backend is ready
      // await projectsService.addProjectStatusUpdate(Number(projectId), update);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Added status update:', update.title);
    } catch (err) {
      setError('Failed to add status update');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED' | 'CANCELLED') => {
    if (!projectId) return;
    
    // Optimistic update - immediate UI feedback
    const previousStatus = optimisticStatus || data.projectStatus;
    setOptimisticStatus(status);
    
    setLoading(true);
    try {
      // Real API call to backend
      await projectsService.updateProjectStatus(Number(projectId), status);
      
      // Revalidate project data to get real status from backend
      await mutate(`project-${projectId}`);
      
      console.log('✅ Successfully updated project status in backend:', status);
    } catch (err) {
      console.error('❌ Failed to update project status in backend:', err);
      
      // Rollback optimistic update on error
      setOptimisticStatus(previousStatus);
      setError('Failed to update project status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: ProjectOverviewContextValue = {
    data,
    loading,
    error,
    updateDescription,
    addMember,
    removeMember,
    addGoal,
    updateGoal,
    addStatusUpdate,
    updateProjectStatus
  };

  return (
    <ProjectOverviewContext.Provider value={value}>
      {children}
    </ProjectOverviewContext.Provider>
  );
}

export function useProjectOverview() {
  const context = useContext(ProjectOverviewContext);
  if (context === undefined) {
    throw new Error('useProjectOverview must be used within a ProjectOverviewProvider');
  }
  return context;
}