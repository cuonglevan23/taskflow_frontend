import React from 'react';
import { ProgressCard, ProgressBar } from './ProgressBar';
import { TeamProgress, ProjectProgress, TeamProjectProgress } from '@/services/progressService';
import { DARK_THEME } from '@/constants/theme';
import { Folder, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TeamProgressCardProps {
  teamProgress: TeamProgress;
  onRefresh?: () => void;
  loading?: boolean;
}

export function TeamProgressCard({ teamProgress, onRefresh, loading }: TeamProgressCardProps) {
  const { teamName, totalTasks, completedTasks, completionPercentage, lastUpdated } = teamProgress;
  
  return (
    <ProgressCard
      title={teamName}
      value={completedTasks}
      max={totalTasks}
      percentage={completionPercentage}
      icon={<Users size={20} color={DARK_THEME.text.secondary} />}
    >
      <div className="flex justify-between items-center text-xs mt-2">
        <span style={{ color: DARK_THEME.text.secondary }}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </span>
        
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1 p-1"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        )}
      </div>
    </ProgressCard>
  );
}

interface ProjectProgressCardProps {
  projectProgress: ProjectProgress;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ProjectProgressCard({ projectProgress, onRefresh, loading }: ProjectProgressCardProps) {
  const { 
    projectName, 
    totalTasks, 
    completedTasks, 
    completionPercentage, 
    lastUpdated,
    teamProjectProgressList
  } = projectProgress;
  
  return (
    <ProgressCard
      title={projectName}
      value={completedTasks}
      max={totalTasks}
      percentage={completionPercentage}
      icon={<Folder size={20} color={DARK_THEME.text.secondary} />}
    >
      <div className="mt-3">
        {teamProjectProgressList && teamProjectProgressList.length > 0 && (
          <div className="mt-4">
            <h4 style={{ color: DARK_THEME.text.secondary }} className="text-sm font-medium mb-2">
              Teams
            </h4>
            <div className="space-y-3">
              {teamProjectProgressList.map((teamProgress) => (
                <div key={teamProgress.teamId} className="pl-2">
                  <div className="text-xs mb-1" style={{ color: DARK_THEME.text.secondary }}>
                    {teamProgress.teamName}
                  </div>
                  <ProgressBar 
                    percentage={teamProgress.completionPercentage} 
                    size="sm"
                    color="auto"
                    label={`${teamProgress.completedTasks}/${teamProgress.totalTasks} tasks`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs mt-3">
        <span style={{ color: DARK_THEME.text.secondary }}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </span>
        
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1 p-1"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        )}
      </div>
    </ProgressCard>
  );
}
