import React, { useState } from 'react';
import { Plus, Globe, Triangle, Smile, AtSign, Star, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';

interface TaskDetailFooterProps {
  task: TaskListItem | null;
  comment: string;
  setComment: (comment: string) => void;
}

const TaskDetailFooter = ({
  task,
  comment,
  setComment
}: TaskDetailFooterProps) => {
  const [showCommentEditor, setShowCommentEditor] = useState(false);

  return (
    <div 
      className="border-t"
      style={{ 
        borderColor: DARK_THEME.border.color,
        backgroundColor: DARK_THEME.background.sidebar
      }}
    >
      {/* Add Comment Section */}
      <div className="p-6">
        <div className="flex items-start gap-3">
          <Avatar
            name="cuonglv.21ad@vku.udn.vn"
            size="sm"
            className="w-8 h-8 bg-pink-500"
          />
          <div className="flex-1">
            {showCommentEditor ? (
              <div 
                className="rounded-lg overflow-hidden border"
                style={{
                  backgroundColor: DARK_THEME.background.weakHover,
                  borderColor: DARK_THEME.border.color
                }}
              >
                <div className="p-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment"
                    className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div 
                  className="flex items-center justify-between p-3 border-t"
                  style={{
                    backgroundColor: DARK_THEME.background.sidebar,
                    borderColor: DARK_THEME.border.color
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon toolbar */}
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Triangle className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <AtSign className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Star className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-1">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-4">
                      <span>0 people will be notified</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCommentEditor(false)}
                      className="text-gray-400 hover:text-gray-200 text-sm h-8 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8 px-4 font-medium"
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="min-h-20 border rounded-lg p-4 cursor-text transition-all duration-200 ease-in-out flex items-center"
                style={{
                  backgroundColor: DARK_THEME.background.weakHover,
                  borderColor: DARK_THEME.border.color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.sidebar;
                  e.currentTarget.style.borderColor = '#6B7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                  e.currentTarget.style.borderColor = DARK_THEME.border.color;
                }}
                onClick={() => setShowCommentEditor(true)}
              >
                <span className="text-gray-400 text-sm">Add a comment</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaborators */}
      <div 
        className="px-6 py-4 border-t"
        style={{
          backgroundColor: `${DARK_THEME.background.weakHover}60`,
          borderColor: DARK_THEME.border.color
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Collaborators</span>
            <div className="flex items-center gap-1">
              {task?.assignees?.slice(0, 3).map((assignee) => (
                <Avatar
                  key={assignee.id}
                  name={assignee.name}
                  size="sm"
                  className="w-8 h-8 -ml-1 first:ml-0 border-2 border-gray-900"
                />
              ))}
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 -ml-1">
                <Plus className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 -ml-1">
                <Plus className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300 text-sm font-medium ml-1">
                +
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Leave task</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailFooter;