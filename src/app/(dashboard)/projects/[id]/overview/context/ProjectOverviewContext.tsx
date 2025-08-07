"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProject } from '../../components/DynamicProjectProvider';

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
  status: 'on_track' | 'at_risk' | 'off_track';
  owner: TeamMember;
}

interface StatusUpdate {
  id: string;
  type: 'status_update' | 'milestone' | 'activity';
  title: string;
  description: string;
  author: TeamMember;
  timestamp: Date;
  status?: 'on_track' | 'at_risk' | 'off_track';
}

interface ProjectOverviewData {
  description: string;
  members: TeamMember[];
  goals: Goal[];
  portfolios: Portfolio[];
  statusUpdates: StatusUpdate[];
  projectStatus: 'on_track' | 'at_risk' | 'off_track';
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
  updateProjectStatus: (status: 'on_track' | 'at_risk' | 'off_track') => Promise<void>;
}

const ProjectOverviewContext = createContext<ProjectOverviewContextValue | undefined>(undefined);

interface ProjectOverviewProviderProps {
  children: ReactNode;
}

// Mock data
const mockData: ProjectOverviewData = {
  description: "This is a sample project description",
  projectStatus: 'on_track',
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
      title: 'Complete project setup',
      description: 'Set up project infrastructure and team',
      progress: 100,
      status: 'completed'
    }
  ],
  portfolios: [
    {
      id: '1',
      name: 'My first portfolio',
      color: '#8b5cf6',
      status: 'on_track',
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
      title: 'This project is kicked off!',
      description: 'This is a sample project status update in Asana. Use status updates to communicate the progress of your project with your teammates.',
      author: {
        id: '1',
        name: 'Vân Lê',
        role: 'Project owner',
        avatar: 'VL'
      },
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      status: 'on_track'
    },
    {
      id: '2',
      type: 'activity',
      title: 'My workspace team joined',
      description: 'Team members were added to the project',
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
  const [data, setData] = useState<ProjectOverviewData>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update description based on project data
  useEffect(() => {
    if (project) {
      setData(prev => ({
        ...prev,
        description: project.description || prev.description
      }));
    }
  }, [project]);

  // Actions
  const updateDescription = async (description: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(prev => ({ ...prev, description }));
    } catch (err) {
      setError('Failed to update description');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newMember: TeamMember = {
        ...member,
        id: Date.now().toString()
      };
      setData(prev => ({
        ...prev,
        members: [...prev.members, newMember]
      }));
    } catch (err) {
      setError('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
    } catch (err) {
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString()
      };
      setData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
    } catch (err) {
      setError('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      }));
    } catch (err) {
      setError('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const addStatusUpdate = async (update: Omit<StatusUpdate, 'id' | 'timestamp'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUpdate: StatusUpdate = {
        ...update,
        id: Date.now().toString(),
        timestamp: new Date()
      };
      setData(prev => ({
        ...prev,
        statusUpdates: [newUpdate, ...prev.statusUpdates]
      }));
    } catch (err) {
      setError('Failed to add status update');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (status: 'on_track' | 'at_risk' | 'off_track') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(prev => ({ ...prev, projectStatus: status }));
    } catch (err) {
      setError('Failed to update project status');
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