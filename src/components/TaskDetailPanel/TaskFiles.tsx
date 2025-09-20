import React from 'react';
import { Paperclip } from 'lucide-react';
import { TaskListItem } from '@/components/TaskList/types';
import { FileDisplayGrid } from '@/components/FileDisplayGrid';
import TaskAttachments from './TaskAttachments';

interface TaskFilesProps {
  task: TaskListItem | null;
  fileRefreshTrigger?: number;
  onRemoveAttachment?: (attachmentId: string) => void;
}

const TaskFiles: React.FC<TaskFilesProps> = ({
  task,
  fileRefreshTrigger,
  onRemoveAttachment
}) => {
  return (
    <>
      {/* Task Files Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Files
          </h3>
        </div>

        {task?.id ? (
          <FileDisplayGrid
            taskId={parseInt(task.id)}
            refreshTrigger={fileRefreshTrigger}
          />
        ) : (
          <div className="text-sm text-gray-400 italic border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            Task not loaded
          </div>
        )}
      </div>

      {/* Legacy Task Attachments - Keep for backward compatibility */}
      {task?.attachments && task.attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Legacy Attachments ({task.attachments.length})
          </h3>

          <TaskAttachments
            attachments={task.attachments}
            onRemoveAttachment={onRemoveAttachment}
          />
        </div>
      )}
    </>
  );
};

export default TaskFiles;
