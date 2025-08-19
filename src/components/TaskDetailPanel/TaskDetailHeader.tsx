import React from 'react';
import { X, Share, Paperclip, MessageCircle, Link, Maximize2, MoreHorizontal, ExternalLink, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskListItem, TaskStatus } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';

interface TaskDetailHeaderProps {
  task: TaskListItem | null;
  onClose: () => void;
  onMarkComplete?: () => void;
}

const TaskDetailHeader = ({
  task,
  onClose,
  onMarkComplete
}: TaskDetailHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: DARK_THEME.border.color }}
      >
        <div className="flex items-center gap-3">
          {task && (
            <Button
              type="button"
              onClick={onMarkComplete}
              className={`flex items-center gap-2 text-sm font-medium ${
                (task.status === 'done' || task.status === 'completed' || task.completed)
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-800 text-gray-200'
              }`}
              style={{
                backgroundColor: `${DARK_THEME.background.weakHover}80`,
                borderColor: DARK_THEME.border.default
              }}
              onMouseEnter={(e) => {
                if (!(task.status === 'done' || task.status === 'completed' || task.completed)) {
                  e.currentTarget.style.color = '#66a88b';
                  e.currentTarget.style.borderColor = '#32695d';
                }
              }}
              onMouseLeave={(e) => {
                if (!(task.status === 'done' || task.status === 'completed' || task.completed)) {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.borderColor = DARK_THEME.border.default;
                }
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {(task.status === 'done' || task.status === 'completed' || task.completed) ? 'Completed' : 'Mark complete'}
              
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Share className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Privacy Banner */}
      <div 
        className="flex items-center justify-between p-2 border-b"
        style={{
          backgroundColor: `${DARK_THEME.background.weakHover}80`,
          borderColor: DARK_THEME.border.default
        }}
      >
        <div className="flex items-center gap-2 text-gray-300">
          <Lock className="w-4 h-4" />
          <span className="text-sm">This task is private to you.</span>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 text-sm">
          Make public
        </Button>
      </div>
    </>
  );
};

export default TaskDetailHeader;