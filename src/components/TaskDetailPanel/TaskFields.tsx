import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { TaskListItem } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface TaskAssigneesProps {
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  onAssigneeChange?: (taskId: string, assigneeData: { id: string; name: string; email: string }) => void;
  taskId?: string;
}

const TaskAssignees: React.FC<TaskAssigneesProps> = ({
  assignees,
  onAssigneeChange,
  taskId
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

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm font-medium w-20"
        style={{ color: theme.text.secondary }}
      >
        {t('taskFields.assignee')}
      </span>
      <div className="flex items-center gap-2 flex-1">
        {assignees.length > 0 ? (
          <div className="flex items-center gap-3 ml-12">
            {/* Avatar Group */}
            <div className="flex items-center -space-x-2">
              {assignees.slice(0, 3).map((assignee, index) => (
                <UserAvatar
                  key={assignee.id || index}
                  name={assignee.name}
                  email={assignee.email}
                  avatar={assignee.avatar}
                  size="sm"
                  className="w-8 h-8 border-2"
                  style={{ borderColor: theme.border.default }}
                />
              ))}

              {assignees.length > 3 && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2"
                  style={{
                    backgroundColor: theme.background.secondary,
                    color: theme.text.primary,
                    borderColor: theme.border.default
                  }}
                >
                  +{assignees.length - 3}
                </div>
              )}
            </div>

            {/* Names list */}
            <div className="flex flex-col gap-1">
              {assignees.slice(0, 2).map((assignee, index) => (
                <span
                  key={assignee.id || index}
                  className="text-sm"
                  style={{ color: theme.text.primary }}
                >
                  {assignee.name}
                </span>
              ))}

              {assignees.length > 2 && (
                <span
                  className="text-xs"
                  style={{ color: theme.text.muted }}
                >
                  +{assignees.length - 2} {t('taskFields.moreAssignees')}
                </span>
              )}
            </div>

            <Button variant="ghost" size="sm" className="p-0 h-auto ml-auto" style={{ color: theme.text.muted }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm ml-12 hover:opacity-80"
            style={{ color: theme.text.muted }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('taskFields.assign')}
          </Button>
        )}
      </div>
    </div>
  );
};

interface TaskDatesProps {
  task: TaskListItem | null;
  onDueDateChange?: (taskId: string, dueDate: string) => void;
  onStartDateChange?: (taskId: string, startDate: string) => void;
}

export const TaskDates: React.FC<TaskDatesProps> = ({
  task,
  onDueDateChange,
  onStartDateChange
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

  return (
    <>
      {/* Due date */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-medium w-20"
          style={{ color: theme.text.secondary }}
        >
          {t('taskFields.dueDate')}
        </span>
        <div className="flex items-center gap-2 flex-1">
          <Calendar
            className="ml-12 w-4 h-4"
            style={{ color: theme.text.muted }}
          />
          {task?.deadline || task?.dueDate ? (
            <span
              className="text-sm"
              style={{ color: theme.text.primary }}
            >
              {new Date(task.deadline || task.dueDate || '').toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          ) : (
            <span
              className="text-sm"
              style={{ color: theme.text.muted }}
            >
              {t('taskFields.noDueDate')}
            </span>
          )}
        </div>
      </div>

      {/* Start date */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-medium w-20"
          style={{ color: theme.text.secondary }}
        >
          {t('taskFields.startDate')}
        </span>
        <div className="flex items-center gap-2 flex-1">
          <Calendar
            className="ml-12 w-4 h-4"
            style={{ color: theme.text.muted }}
          />
          {task?.startDate ? (
            <span
              className="text-sm"
              style={{ color: theme.text.primary }}
            >
              {new Date(task.startDate || '').toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          ) : (
            <span
              className="text-sm"
              style={{ color: theme.text.muted }}
            >
              {t('taskFields.noStartDate')}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

interface TaskProjectProps {
  task: TaskListItem | null;
  onProjectChange?: (taskId: string, projectId: string) => void;
}

export const TaskProject: React.FC<TaskProjectProps> = ({
  task,
  onProjectChange
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

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm font-medium w-20"
        style={{ color: theme.text.secondary }}
      >
        {t('taskFields.projects')}
      </span>
      <div className="flex items-center gap-2 flex-1">
        {task?.project || task?.projectName ? (
          <div className="flex items-center gap-2 ml-12">
            <span
              className="text-sm"
              style={{ color: theme.text.primary }}
            >
              {task.project || task.projectName}
            </span>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="ml-10 text-sm hover:opacity-80"
            style={{ color: theme.text.muted }}
          >
            {t('taskFields.addToProjects')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskAssignees;
