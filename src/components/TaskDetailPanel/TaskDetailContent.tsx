import React, { useState } from 'react';
import { Calendar, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import CommentsList from './CommentsList';

interface TaskDetailContentProps {
  task: TaskListItem | null;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onSave: () => void;
}

type TabType = 'comments' | 'activity';

const TaskDetailContent = ({
  task,
  title,
  setTitle,
  description,
  setDescription,
  onSave
}: TaskDetailContentProps) => {
  // Use the custom hook to get and update task description
  const taskId = task?.id ? String(task.id) : null;
  const [activeTab, setActiveTab] = useState<TabType>('comments');

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Task Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="w-full text-2xl font-bold border border-transparent outline-none resize-none placeholder:text-gray-400 text-white rounded-lg p-3 transition-all duration-200 focus:border-solid focus:border-gray-400"
          style={{
            backgroundColor: DARK_THEME.background.primary,
            borderWidth: '1px'
          }}
          placeholder={task ? task.name : "Task name"}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Assignee</span>
          <div className="flex items-center gap-2 flex-1">
            {(task?.assignees?.length > 0 || (task as any)?.assignedEmails?.length > 0) ? (
              <div className="flex items-center gap-3 ml-12">
                {/* Avatar Group for all assignees */}
                <div className="flex items-center -space-x-2">
                  {/* Show user assignees */}
                  {task.assignees?.slice(0, 3).map((assignee, index) => (
                    <Avatar
                      key={assignee.id || index}
                      name={assignee.name}
                      size="sm"
                      className="w-8 h-8 border-2 border-gray-700"
                    />
                  ))}
                  
                  {/* Show email assignees */}
                  {((task as any)?.assignedEmails || []).slice(0, Math.max(0, 3 - (task.assignees?.length || 0))).map((email: string) => (
                    <Avatar
                      key={email}
                      name={email}
                      size="sm"
                      className="w-8 h-8 border-2 border-gray-700"
                    />
                  ))}
                  
                  {/* Show count if more than 3 total */}
                  {((task.assignees?.length || 0) + ((task as any)?.assignedEmails?.length || 0)) > 3 && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-gray-700">
                      +{((task.assignees?.length || 0) + ((task as any)?.assignedEmails?.length || 0)) - 3}
                    </div>
                  )}
                </div>
                
                {/* Names list */}
                <div className="flex flex-col gap-1">
                  {task.assignees?.slice(0, 2).map((assignee, index) => (
                    <span key={assignee.id || index} className="text-sm text-gray-300">
                      {assignee.name}
                    </span>
                  ))}
                  {((task as any)?.assignedEmails || []).slice(0, Math.max(0, 2 - (task.assignees?.length || 0))).map((email: string) => (
                    <span key={email} className="text-sm text-gray-300">
                      {email}
                    </span>
                  ))}
                  {((task.assignees?.length || 0) + ((task as any)?.assignedEmails?.length || 0)) > 2 && (
                    <span className="text-xs text-gray-400">
                      +{((task.assignees?.length || 0) + ((task as any)?.assignedEmails?.length || 0)) - 2} more...
                    </span>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-400 ml-auto">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 text-sm ml-12">
                <Plus className="w-4 h-4 mr-2" />
                Assign
              </Button>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-sm">
                Do today
              </Button>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Due date</span>
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="ml-12 w-4 h-4 text-gray-400" />
            {task?.deadline || task?.dueDate ? (
              <span className="text-sm text-gray-300">
                {new Date(task.deadline || task.dueDate || '').toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No due date</span>
            )}
          </div>
        </div>

        {/* Start date - Added for calendar tasks */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Start date</span>
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="ml-12 w-4 h-4 text-gray-400" />
            {task?.startDate ? (
              <span className="text-sm text-gray-300">
                {new Date(task.startDate || '').toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No start date</span>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Projects</span>
          <div className="flex items-center gap-2 flex-1">
            {task?.project || task?.projectName ? (
              <div className="flex items-center gap-2 ml-12">
                <span className="text-sm text-gray-300">{task.project || task.projectName}</span>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="ml-10 text-gray-400 hover:text-gray-200 text-sm">
                Add to projects
              </Button>
            )}
          </div>
        </div>

        {/* Dependencies */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-300 w-20">Dependencies</span>
          <Button
              variant="ghost"
              size="sm"
              className="ml-10 text-gray-400 hover:text-gray-200 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add dependencies
            </Button>
        </div>
      </div>

      {/* Task Description */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">Description</h3>
        <div className="min-h-[120px] border rounded-lg overflow-hidden" style={{ borderColor: DARK_THEME.border.default }}>
          <MinimalTiptap 
            content={description} 
            onChange={setDescription}
            placeholder="Add a description..." 
          />
        </div>
      </div>

      {/* Add Subtask */}
      <div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add subtask
        </Button>
      </div>

      {/* Comments & Activity Section */}
      <div 
        className="space-y-6 border-t pt-6"
        style={{ borderColor: DARK_THEME.border.default }}
      >
        {/* Tabs */}
        <div className="flex gap-6">
          <button 
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'comments' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
          <button 
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'activity' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            All activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'comments' ? (
            /* Comments Content */
            <CommentsList taskId={taskId} />
          ) : (
            /* Activity Content */
            <>
              {/* Activity Item 1 */}
              <div className="flex items-start gap-3">
                <Avatar
                  name="cuonglv.21ad@vku.udn.vn"
                  size="sm"
                  className="w-8 h-8 bg-pink-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-gray-400">
                    <span className="text-blue-400 font-medium">cuonglv.21ad@vku.udn.vn</span> created this task · <span className="text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start gap-3">
                <Avatar
                  name="cuonglv.21ad@vku.udn.vn"
                  size="sm"
                  className="w-8 h-8 bg-pink-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-gray-400">
                    <span className="text-blue-400 font-medium">cuonglv.21ad@vku.udn.vn</span> moved this task from &quot;Do today&quot; to &quot;Recently assigned&quot; in <span className="text-blue-400">My tasks</span> · <span className="text-gray-500">3 minutes ago</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="flex items-start gap-3">
                <Avatar
                  name="cuonglv.21ad@vku.udn.vn"
                  size="sm"
                  className="w-8 h-8 bg-pink-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-medium text-sm">cuonglv.21ad@vku.udn.vn</span>
                    <span className="text-gray-500 text-xs">· 2 minutes ago</span>
                  </div>
                  <div className="text-sm text-gray-200 bg-gray-800 rounded-lg p-3 border border-gray-600">
                    d
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Avatar
                  name="cuonglv.21ad@vku.udn.vn"
                  size="sm"
                  className="w-8 h-8 bg-pink-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-medium text-sm">cuonglv.21ad@vku.udn.vn</span>
                    <span className="text-gray-500 text-xs">· Just now</span>
                  </div>
                  <div className="text-sm text-gray-200 bg-gray-800 rounded-lg p-3 border border-gray-600">
                    j
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailContent;
