import React from 'react';
import { TeamProgress } from '@/services/progressService';
import { DARK_THEME } from '@/constants/theme';
import { Users, Calendar } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TeamProgressCardProps {
  teamProgress: TeamProgress;
  onClick?: () => void;
}

export function TeamProgressCard({ teamProgress, onClick }: TeamProgressCardProps) {
  const {
    teamName,
    totalTasks,
    completedTasks,
    completionPercentage,
    lastUpdated,
    teamOwner,
    teamMembers
  } = teamProgress;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 50) return '#f59e0b'; // yellow
    if (percentage >= 25) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="p-6 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg"
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border?.default || '#424244',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = DARK_THEME.text.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = DARK_THEME.border?.default || '#424244';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: DARK_THEME.background.primary }}
          >
            <Users size={20} style={{ color: DARK_THEME.text.secondary }} />
          </div>
          <div>
            <h3 
              className="text-lg font-semibold"
              style={{ color: DARK_THEME.text.primary }}
            >
              {teamName}
            </h3>
            <p 
              className="text-sm"
              style={{ color: DARK_THEME.text.secondary }}
            >
              Team Owner: {teamOwner.displayName}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: getProgressColor(completionPercentage) }}
          >
            {Math.round(completionPercentage)}%
          </div>
          <p 
            className="text-xs"
            style={{ color: DARK_THEME.text.secondary }}
          >
            completion
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: DARK_THEME.background.primary }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: getProgressColor(completionPercentage)
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span style={{ color: DARK_THEME.text.secondary }}>
            {completedTasks} completed
          </span>
          <span style={{ color: DARK_THEME.text.secondary }}>
            {totalTasks} total tasks
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} style={{ color: DARK_THEME.text.secondary }} />
          <span 
            className="text-sm font-medium"
            style={{ color: DARK_THEME.text.secondary }}
          >
            Team Members ({teamMembers.length})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {teamMembers.slice(0, 5).map((member) => (
            <div key={member.userId} className="relative group">
              <UserAvatar
                name={member.displayName}
                email={member.email}
                avatar={member.avatarUrl}
                size="sm"
                className="border-2"
                style={{ borderColor: DARK_THEME.background.secondary }}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                style={{ 
                  backgroundColor: DARK_THEME.background.primary,
                  color: DARK_THEME.text.primary,
                  border: `1px solid ${DARK_THEME.border?.default}`
                }}
              >
                {member.displayName}
              </div>
            </div>
          ))}
          
          {teamMembers.length > 5 && (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: DARK_THEME.background.primary,
                color: DARK_THEME.text.secondary 
              }}
            >
              +{teamMembers.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs">
        <Calendar size={12} style={{ color: DARK_THEME.text.secondary }} />
        <span style={{ color: DARK_THEME.text.secondary }}>
          Last updated: {formatDate(lastUpdated)}
        </span>
      </div>
    </div>
  );
}
