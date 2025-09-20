import React from 'react';
import { Calendar, Plus, CheckCircle, Paperclip, AlertTriangle, Edit, Type, FileText, MessageSquare, UserPlus, UserMinus, CheckCircle2, RotateCcw, ListPlus, ListMinus, CheckSquare, Users, FolderOpen, Circle } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { TaskActivityResponseDto, getActivityConfig, TaskActivityType } from '@/services/taskActivityService';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface TaskActivityItemProps {
  activity: TaskActivityResponseDto | any;
}

const TaskActivityItem: React.FC<TaskActivityItemProps> = ({ activity }) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested translation
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // fallback to key if translation not found
      }
    }
    return String(value);
  };

  const config = getActivityConfig(activity.activityType as TaskActivityType);

  // Handle different activity structures (regular vs project activities)
  const authorName = activity.user?.displayName || activity.author?.name || activity.authorName || t('taskActivityList.unknownUser');
  const authorAvatar = activity.user?.avatarUrl || activity.author?.avatar || activity.authorAvatar || null;
  const authorEmail = activity.user?.email || activity.author?.email || `activity${activity.id}@unknown.com`;

  // Helper function to render activity icon
  const renderActivityIcon = (activityType: string) => {
    const iconProps = { className: `w-3 h-3 ${config.color}` };

    switch (config.icon) {
      case 'Plus': return <Plus {...iconProps} />;
      case 'CheckCircle': return <CheckCircle {...iconProps} />;
      case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'Edit': return <Edit {...iconProps} />;
      case 'Type': return <Type {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'MessageSquare': return <MessageSquare {...iconProps} />;
      case 'Paperclip': return <Paperclip {...iconProps} />;
      case 'UserPlus': return <UserPlus {...iconProps} />;
      case 'UserMinus': return <UserMinus {...iconProps} />;
      case 'CheckCircle2': return <CheckCircle2 {...iconProps} />;
      case 'RotateCcw': return <RotateCcw {...iconProps} />;
      case 'ListPlus': return <ListPlus {...iconProps} />;
      case 'ListMinus': return <ListMinus {...iconProps} />;
      case 'CheckSquare': return <CheckSquare {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'FolderOpen': return <FolderOpen {...iconProps} />;
      default: return <Circle {...iconProps} />;
    }
  };

  return (
    <div key={activity.id} className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center mt-0.5`}>
        {renderActivityIcon(activity.activityType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <UserAvatar
            name={authorName}
            email={authorEmail}
            avatar={authorAvatar}
            size="sm"
            className="w-5 h-5"
          />
          <span
            className="text-sm font-medium"
            style={{ color: theme.text.primary }}
          >
            {authorName}
          </span>
          <span
            className="text-xs"
            style={{ color: theme.text.muted }}
          >
            {activity.description}
          </span>
          {activity.newValue && (
            <span className="text-xs text-blue-400">{activity.newValue}</span>
          )}
        </div>
        <div
          className="text-xs"
          style={{ color: theme.text.muted }}
        >
          {activity.timeAgo}
        </div>
      </div>
    </div>
  );
};

interface TaskActivityListProps {
  activities: any[];
  groupedActivities: {
    TODAY: any[];
    YESTERDAY: any[];
    EARLIER: any[];
  };
  isLoading: boolean;
}

const TaskActivityList: React.FC<TaskActivityListProps> = ({
  activities,
  groupedActivities,
  isLoading
}) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested translation
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // fallback to key if translation not found
      }
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="text-sm"
          style={{ color: theme.text.muted }}
        >
          {t('taskActivityList.loadingActivities')}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div
          className="text-sm"
          style={{ color: theme.text.muted }}
        >
          {t('taskActivityList.noActivityYet')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's activities */}
      {groupedActivities.TODAY.length > 0 && (
        <div>
          <h4
            className="text-xs font-medium uppercase mb-3"
            style={{ color: theme.text.muted }}
          >
            {t('taskActivityList.today')}
          </h4>
          <div className="space-y-3">
            {groupedActivities.TODAY.map((activity) => (
              <TaskActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday's activities */}
      {groupedActivities.YESTERDAY.length > 0 && (
        <div>
          <h4
            className="text-xs font-medium uppercase mb-3"
            style={{ color: theme.text.muted }}
          >
            {t('taskActivityList.yesterday')}
          </h4>
          <div className="space-y-3">
            {groupedActivities.YESTERDAY.map((activity) => (
              <TaskActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Earlier activities */}
      {groupedActivities.EARLIER.length > 0 && (
        <div>
          <h4
            className="text-xs font-medium uppercase mb-3"
            style={{ color: theme.text.muted }}
          >
            {t('taskActivityList.earlier')}
          </h4>
          <div className="space-y-3">
            {groupedActivities.EARLIER.map((activity) => (
              <TaskActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskActivityList;
