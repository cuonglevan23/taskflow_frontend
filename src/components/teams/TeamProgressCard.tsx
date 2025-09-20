import React from 'react';
import { TeamProgress } from '@/services/process/progressService';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Users, Calendar } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TeamProgressCardProps {
  teamProgress: TeamProgress;
  onClick?: () => void;
}

export function TeamProgressCard({ teamProgress, onClick }: TeamProgressCardProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

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
    if (percentage >= 75) return theme.status.success; // green
    if (percentage >= 50) return theme.status.warning; // yellow
    if (percentage >= 25) return theme.status.error; // red
    return theme.text.muted; // gray
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
        backgroundColor: theme.background.secondary,
        borderColor: theme.border?.default || '#424244',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = theme.text.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = theme.border?.default || '#424244';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: theme.background.primary }}
          >
            <Users size={20} style={{ color: theme.text.secondary }} />
          </div>
          <div>
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              {teamName}
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              {messages?.common?.teamOwner || "Team Owner"}: {teamOwner.displayName}
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
            style={{ color: theme.text.secondary }}
          >
            {messages?.common?.completion || "completion"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.background.primary }}
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
          <span style={{ color: theme.text.secondary }}>
            {completedTasks} {messages?.common?.completed || "completed"}
          </span>
          <span style={{ color: theme.text.secondary }}>
            {totalTasks} {messages?.common?.totalTasks || "total tasks"}
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} style={{ color: theme.text.secondary }} />
          <span
            className="text-sm font-medium"
            style={{ color: theme.text.secondary }}
          >
            {messages?.common?.teamMembers || "Team Members"} ({teamMembers.length})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {teamMembers.slice(0, 5).map((member: any) => (
            <div key={member.userId} className="relative group">
              <UserAvatar
                name={member.displayName}
                email={member.email}
                avatar={member.avatarUrl}
                size="sm"
                className="border-2"
                style={{ borderColor: theme.background.secondary }}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                style={{ 
                  backgroundColor: theme.background.primary,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border?.default}`
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
                backgroundColor: theme.background.primary,
                color: theme.text.secondary
              }}
            >
              +{teamMembers.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs">
        <Calendar size={12} style={{ color: theme.text.secondary }} />
        <span style={{ color: theme.text.secondary }}>
          {messages?.common?.lastUpdated || "Last updated"}: {formatDate(lastUpdated)}
        </span>
      </div>
    </div>
  );
}
