import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Plus, CheckCircle, Paperclip, AlertTriangle, Edit, Type, FileText, MessageSquare, UserPlus, UserMinus, CheckCircle2, RotateCcw, ListPlus, ListMinus, CheckSquare, Users, FolderOpen, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import CommentsList from './CommentsList';
import TaskAttachments from './TaskAttachments';
import { useTaskActivities } from '@/hooks/useTaskActivities';
import { TaskActivityResponseDto, getActivityConfig, TaskActivityType } from '@/services/taskActivityService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskDetailContentProps {
  task: TaskListItem | null;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onSave: () => void;
  onSaveDescription?: (newDescription: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskPriorityChange?: (taskId: string, priority: string) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
}

type TabType = 'comments' | 'activity';

const TaskDetailContent = ({
  task,
  title,
  setTitle,
  description,
  setDescription,
  onSave,
  onSaveDescription, // Keep for future use but don't use it to prevent closing
  onTaskStatusChange,
  onTaskPriorityChange,
  onRemoveAttachment
}: TaskDetailContentProps) => {
  // Use the custom hook to get and update task description
  const taskId = task?.id ? String(task.id) : null;
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fetch task activities using the custom hook
  const {
    activities,
    groupedActivities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useTaskActivities({
    taskId: taskId || '',
    enabled: !!taskId && activeTab === 'activity',
    pollInterval: 30000 // Refresh every 30 seconds when tab is active
  });

  // Helper function to render activity icon
  const renderActivityIcon = (activityType: string) => {
    const config = getActivityConfig(activityType as Parameters<typeof getActivityConfig>[0]);
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

  // Helper function to render activity item
  const renderActivityItem = (activity: TaskActivityResponseDto) => {
    const config = getActivityConfig(activity.activityType as TaskActivityType);
    
    return (
      <div key={activity.id} className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center mt-0.5`}>
          {renderActivityIcon(activity.activityType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar 
              name={activity.user.displayName}
              avatar={activity.user.avatarUrl}
              size="sm"
              className="w-5 h-5"
            />
            <span className="text-sm text-white font-medium">{activity.user.displayName}</span>
            <span className="text-xs text-gray-400">{activity.description}</span>
            {activity.newValue && (
              <span className="text-xs text-blue-400">{activity.newValue}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">{activity.timeAgo}</div>
        </div>
      </div>
    );
  };

  // Update tempDescription when description prop changes
  useEffect(() => {
    if (!isEditingDescription) {
      setTempDescription(description);
    }
  }, [description, isEditingDescription]);

  const handleSave = () => {
    onSave();
  };

  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
    setTempDescription(description);
  };

  const handleDescriptionSave = useCallback(() => {
    // Update description locally first
    setDescription(tempDescription);
    setIsEditingDescription(false);
    
    // Delayed save to backend without closing panel
    if (onSaveDescription) {
      // Use setTimeout to prevent immediate callback execution that might close panel
      setTimeout(() => {
        onSaveDescription(tempDescription);
      }, 100);
    }
  }, [tempDescription, setDescription, onSaveDescription]);

  const handlePriorityChange = (newPriority: string) => {
    if (task && onTaskPriorityChange) {
      onTaskPriorityChange(task.id, newPriority);
    }
    setIsEditingPriority(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (task && onTaskStatusChange) {
      onTaskStatusChange(task.id, newStatus);
    }
    setIsEditingStatus(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditingDescription) {
        if (event.key === 'Escape') {
          setIsEditingDescription(false);
          setTempDescription(description);
        }
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          handleDescriptionSave();
        }
      }
    };

    if (isEditingDescription) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingDescription, handleDescriptionSave, description]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 task-detail-content">
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
            {((task?.assignees?.length || 0) > 0 || (task?.assignedEmails?.length || 0) > 0) ? (
              <div className="flex items-center gap-3 ml-12">
                {/* Avatar Group for all assignees */}
                <div className="flex items-center -space-x-2">
                  {/* Show user assignees */}
                  {task?.assignees?.slice(0, 3).map((assignee, index) => (
                    <UserAvatar
                      key={assignee.id || index}
                      name={assignee.name}
                      avatar={assignee.avatar}
                      size="sm"
                      className="w-8 h-8 border-2 border-gray-700"
                    />
                  ))}
                  
                
                  
                  {/* Show count if more than 3 total */}
                  {((task?.assignees?.length || 0) + (task?.assignedEmails?.length || 0)) > 3 && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-gray-700">
                      +{((task?.assignees?.length || 0) + (task?.assignedEmails?.length || 0)) - 3}
                    </div>
                  )}
                </div>
                
                {/* Names list */}
                <div className="flex flex-col gap-1">
                  {task?.assignees?.slice(0, 2).map((assignee, index) => (
                    <span key={assignee.id || index} className="text-sm text-gray-300">
                      {assignee.name}
                    </span>
                  ))}
                  {task?.assignedEmails?.slice(0, Math.max(0, 2 - (task?.assignees?.length || 0))).map((email: string) => (
                    <span key={email} className="text-sm text-gray-300">
                      {email}
                    </span>
                  ))}
                  {((task?.assignees?.length || 0) + (task?.assignedEmails?.length || 0)) > 2 && (
                    <span className="text-xs text-gray-400">
                      +{((task?.assignees?.length || 0) + (task?.assignedEmails?.length || 0)) - 2} more...
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

      </div>

      {/* Fields Section */}
      <div className="space-y-4">    
        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Priority</span>
          <div className="flex items-center gap-2 flex-1">
            <div className="ml-12">
              {isEditingPriority ? (
                <Select
                  value={task?.priority || 'MEDIUM'}
                  onValueChange={(value) => {
                    handlePriorityChange(value);
                    setIsEditingPriority(false);
                  }}
                  open={true}
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsEditingPriority(false);
                    }
                  }}
                >
                  <SelectTrigger className="w-32 bg-gray-700 text-white text-sm border-gray-600 focus:border-blue-500">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[9999] bg-gray-700 border-gray-600 text-white shadow-xl"
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="LOW" className="text-white hover:bg-gray-600 focus:bg-gray-600">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="text-white hover:bg-gray-600 focus:bg-gray-600">Medium</SelectItem>
                    <SelectItem value="HIGH" className="text-white hover:bg-gray-600 focus:bg-gray-600">High</SelectItem>
                    <SelectItem value="URGENT" className="text-white hover:bg-gray-600 focus:bg-gray-600">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div 
                  onClick={() => setIsEditingPriority(true)}
                  className="cursor-pointer"
                >
                  {task?.priority ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'LOW' ? 'bg-green-100 text-green-800' :
                      task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority === 'LOW' ? 'Low' :
                       task.priority === 'MEDIUM' ? 'Medium' :
                       task.priority === 'HIGH' ? 'High' :
                       task.priority === 'URGENT' ? 'Urgent' : task.priority}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 hover:text-gray-300">Click to set priority</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 w-20">Status</span>
          <div className="flex items-center gap-2 flex-1">
            <div className="ml-12">
              {isEditingStatus ? (
                <Select
                  value={task?.status || 'TODO'}
                  onValueChange={(value) => {
                    handleStatusChange(value);
                    setIsEditingStatus(false);
                  }}
                  open={true}
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsEditingStatus(false);
                    }
                  }}
                >
                  <SelectTrigger className="w-40 bg-gray-700 text-white text-sm border-gray-600 focus:border-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[9999] bg-gray-700 border-gray-600 text-white shadow-xl"
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="TODO" className="text-white hover:bg-gray-600 focus:bg-gray-600">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-white hover:bg-gray-600 focus:bg-gray-600">In Progress</SelectItem>
                  
               
        
                    <SelectItem value="DONE" className="text-white hover:bg-gray-600 focus:bg-gray-600">Done</SelectItem>
                 
                  </SelectContent>
                </Select>
              ) : (
                <div 
                  onClick={() => setIsEditingStatus(true)}
                  className="cursor-pointer"
                >
                  {task?.status ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'TODO' ? 'bg-gray-100 text-gray-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'DONE' ? 'bg-green-100 text-green-800' : task.status
                  
                     
                    }`}>
                      {task.status === 'TODO' ? 'To Do' :
                       task.status === 'IN_PROGRESS' ? 'In Progress' :
                       task.status === 'DONE' ? 'Done' : task.status
                     }
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 hover:text-gray-300">Click to set status</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Task Description */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">Description</h3>
        {isEditingDescription ? (
          <div className="space-y-3">
            <div 
              ref={editorRef}
              className="min-h-[120px] border rounded-lg overflow-hidden" 
              style={{ borderColor: DARK_THEME.border.default }}
            >
              <MinimalTiptap 
                content={tempDescription} 
                onChange={setTempDescription}
                placeholder="Add a description..."
              />
            </div>
            {/* Save/Cancel buttons */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDescriptionSave();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditingDescription(false);
                  setTempDescription(description);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="min-h-[120px] border rounded-lg p-4 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200"
            style={{ borderColor: DARK_THEME.border.default }}
            onClick={handleDescriptionClick}
          >
            {description ? (
              <div 
                className="text-gray-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-gray-400 italic">Click to add a description...</p>
            )}
          </div>
        )}
      </div>

      {/* Task Attachments */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Attachments ({task?.attachments?.length || 0})
        </h3>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 bg-gray-800 p-2 rounded">
            Debug: Task has {task?.attachments?.length || 0} attachments
            {task?.attachments && task.attachments.length > 0 && (
              <div>Files: {task.attachments.map(a => a.name).join(', ')}</div>
            )}
          </div>
        )}

        {task?.attachments && task.attachments.length > 0 ? (
          <TaskAttachments
            attachments={task.attachments}
            onRemoveAttachment={onRemoveAttachment}
          />
        ) : (
          <div className="text-sm text-gray-400 italic border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            No files uploaded yet. Use the upload button in the header to add files.
          </div>
        )}
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
            {activities.length > 0 && (
              <span className="ml-1 text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'comments' ? (
            /* Comments Content */
            <CommentsList taskId={taskId} />
          ) : (
            /* Activity Content */
            <div className="p-2 space-y-6">
              {/* Activity Header with Refresh Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {activities.length > 0 && `${activities.length} activities`}
                </div>
                <button
                  onClick={refetchActivities}
                  disabled={activitiesLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {activitiesLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-400">Loading activities...</div>
                </div>
              ) : activitiesError ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="text-sm text-yellow-400">
                    {activitiesError.message.includes('401') || activitiesError.message.includes('404') 
                      ? 'Activity tracking feature is not available yet'
                      : `Error loading activities: ${activitiesError.message}`
                    }
                  </div>
                  {!activitiesError.message.includes('401') && !activitiesError.message.includes('404') && (
                    <button
                      onClick={refetchActivities}
                      className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 border border-blue-400/30 rounded"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-400">No activities yet</div>
                </div>
              ) : (
                <>
                  {/* Today's Activities */}
                  {groupedActivities.TODAY && groupedActivities.TODAY.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">TODAY</div>
                      {groupedActivities.TODAY.map(renderActivityItem)}
                    </div>
                  )}

                  {/* Yesterday's Activities */}
                  {groupedActivities.YESTERDAY && groupedActivities.YESTERDAY.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">YESTERDAY</div>
                      {groupedActivities.YESTERDAY.map(renderActivityItem)}
                    </div>
                  )}

                  {/* Earlier Activities */}
                  {groupedActivities.EARLIER && groupedActivities.EARLIER.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">EARLIER</div>
                      {groupedActivities.EARLIER.map(renderActivityItem)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailContent;
