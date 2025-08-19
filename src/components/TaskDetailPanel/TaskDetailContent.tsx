import React, { useState } from 'react';
import { Calendar, User, Plus, ChevronDown, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';

interface TaskDetailContentProps {
  task: TaskListItem | null;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onSave: () => void;
}

const TaskDetailContent = ({
  task,
  title,
  setTitle,
  description,
  setDescription,
  onSave
}: TaskDetailContentProps) => {
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

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
            {task?.assignees?.[0] ? (
              <div className="flex items-center gap-2">
                <Avatar
                  name={task.assignees[0].name}
                  size="sm"
                  className="ml-12  w-6 h-6"
                />
                <span className="text-sm text-gray-300">{task.assignees[0].name}</span>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-400">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 text-sm">
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
            <Calendar className="ml-12  w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">No due date</span>
          </div>
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Projects</span>
          <div className="flex items-center gap-2 flex-1">
            <Button variant="ghost" size="sm" className="ml-10  text-gray-400 hover:text-gray-200 text-sm">
              Add to projects
            </Button>
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
            dependencies
          </Button>
        </div>


        {/* My tasks fields */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">My tasks fields</span>
          <div className="flex items-center gap-2 flex-1">
            <div
                className="flex items-center gap-2 rounded px-3 py-1 flex-1"
              style={{ backgroundColor: DARK_THEME.background.weakHover }}
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">timer</span>
              <div className="ml-auto text-sm text-gray-400">—</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Description</label>

            <div className="transition-all duration-300 ease-in-out transform pt-3">
              <MinimalTiptap
                  content={description}
                  onChange={(content) => {
                    setDescription(content);
                    handleSave();
                  }}
                  placeholder="What is this task about?"

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

      {/* Comments/Activity Section */}
      <div 
        className="space-y-6 border-t pt-6"
        style={{ borderColor: DARK_THEME.border.color }}
      >
        {/* Comments Tabs */}
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('comments')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'comments' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Comments
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'activity' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Recent Comments */}
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
                <div 
                  className="text-sm text-gray-200 rounded-lg p-3 border"
                  style={{
                    backgroundColor: DARK_THEME.background.weakHover,
                    borderColor: DARK_THEME.border.color
                  }}
                >
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
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
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
                  <span className="text-blue-400 font-medium">cuonglv.21ad@vku.udn.vn</span> moved this task from "Do today" to "Recently assigned" in <span className="text-blue-400">My tasks</span> · <span className="text-gray-500">3 minutes ago</span>
                </div>
              </div>
            </div>

            {/* Recent Comments in Activity */}
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
          </div>
        )}


      </div>

    </div>
  );
};

export default TaskDetailContent;