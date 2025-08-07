"use client";

import { USER_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProject } from '../../components/DynamicProjectProvider';
import { useProjectOverview } from '../context/ProjectOverviewContext';

export function ActivityTimeline() {
  const { project } = useProject();
  const { data } = useProjectOverview();
  const { theme } = useTheme();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_update': return '🟢';
      case 'milestone': return '📍';
      case 'activity': return '👥';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs" style={{ color: theme.text.muted }}>
        {project?.endDate ? `Due: ${new Date(project.endDate).toLocaleDateString()}` : 'No due date'}
      </div>
      
      <button 
        className="text-sm font-medium transition-colors"
        style={{ color: '#3b82f6' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
      >
        Send message to members
      </button>
      
      <div className="space-y-3">
        <div className="text-xs font-medium" style={{ color: theme.text.muted }}>Today — {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
        
        {data.statusUpdates.map((update) => (
          <div key={update.id} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">
              {update.author.avatar}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: theme.text.primary }}>{update.title}</span>
                {update.status && (
                  <div className={`w-2 h-2 rounded-full ${
                    update.status === 'on_track' ? 'bg-green-500' : 
                    update.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                )}
              </div>
              <div className="flex items-center gap-1" style={{ color: theme.text.secondary }}>
                <span>{update.author.name}</span>
                <span>·</span>
                <span>{formatTimeAgo(update.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Static activity items for demonstration */}
        <div className="flex items-start gap-3 text-sm">
          <div className="flex-shrink-0">
            <USER_ICONS.users className="w-4 h-4" style={{ color: theme.text.muted }} />
          </div>
          <div className="flex-1">
            <div style={{ color: theme.text.primary }}>My workspace team joined</div>
            <div className="text-xs" style={{ color: theme.text.muted }}>4 minutes ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}