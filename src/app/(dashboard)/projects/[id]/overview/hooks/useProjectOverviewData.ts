"use client";

import { useState, useEffect } from 'react';
import { useProject } from '../../components/DynamicProjectProvider';

export interface ProjectMetrics {
  tasksCompleted: number;
  totalTasks: number;
  milestonesHit: number;
  totalMilestones: number;
  teamMembersActive: number;
  daysRemaining: number;
}

export function useProjectOverviewData() {
  const { project } = useProject();
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    tasksCompleted: 0,
    totalTasks: 0,
    milestonesHit: 0,
    totalMilestones: 0,
    teamMembersActive: 0,
    daysRemaining: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!project) return;
      
      setLoading(true);
      try {
        // Simulate API call to fetch projects metrics
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Calculate days remaining
        const daysRemaining = project.endDate 
          ? Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        
        // Mock metrics based on projects data
        setMetrics({
          tasksCompleted: 12,
          totalTasks: 18,
          milestonesHit: 2,
          totalMilestones: 5,
          teamMembersActive: 4,
          daysRemaining
        });
      } catch (error) {
        console.error('Failed to fetch projects metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [project]);

  const completionPercentage = metrics.totalTasks > 0 
    ? Math.round((metrics.tasksCompleted / metrics.totalTasks) * 100)
    : 0;
    
  const milestoneProgress = metrics.totalMilestones > 0
    ? Math.round((metrics.milestonesHit / metrics.totalMilestones) * 100)
    : 0;

  return {
    project,
    metrics,
    loading,
    completionPercentage,
    milestoneProgress
  };
}