import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { TaskListItem } from '../../types';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { useProjectMembers } from '@/hooks/tasks/useProjectMembers';
import { DARK_THEME } from '@/constants/theme';

interface ProjectTaskAssigneesProps {
  task: TaskListItem;
  projectId: string | number;
  onSelectUser: (user: { id: string; name: string; email?: string; avatar?: string }) => void;
  onUpdateAssignees?: (taskId: string, assigneeId: number | null, additionalAssigneeIds: number[]) => void;
}

export const ProjectTaskAssignees = ({
  task,
  projectId,
  onSelectUser,
  onUpdateAssignees,
}: ProjectTaskAssigneesProps) => {
  const [showAssigneeList, setShowAssigneeList] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const numericProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
  const numericTaskId = parseInt(task.id);

  // Use the new hooks for project-specific data
  const { members, loading: membersLoading, error } = useProjectMembers(numericProjectId);

  // Initialize selected assignees from current task data
  useEffect(() => {
    const currentAssignees = new Set<number>();

    // Add primary assignee
    if (task.assigneeId) {
      currentAssignees.add(typeof task.assigneeId === 'string' ? parseInt(task.assigneeId) : task.assigneeId);
    }

    // Add additional assignees from task data
    const additionalAssignees = (task as any).additionalAssignees || [];
    additionalAssignees.forEach((assignee: any) => {
      const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
      if (userId) currentAssignees.add(userId);
    });

    setSelectedAssignees(currentAssignees);
  }, [task]);

  // Helper function to get all assignees from different sources
  const getAllAssignees = () => {
    const assignees = [];

    // Method 1: Use task.assignees array first (this should have the correct structure)
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach((assignee: any) => {
        // Try to enhance with member data if available
        const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
        const memberInfo = members.find(m => m.userId === userId);

        assignees.push({
          id: assignee.id.toString(),
          name: assignee.name,
          email: assignee.email || '',
          avatar: memberInfo?.avatarUrl || assignee.avatarUrl || assignee.avatar || undefined
        });
      });
    }

    // Method 2: Fallback to assigneeId + additionalAssignees if task.assignees is empty
    if (assignees.length === 0) {
      // Primary assignee
      if (task.assigneeId) {
        const assigneeId = typeof task.assigneeId === 'string' ? parseInt(task.assigneeId) : task.assigneeId;
        const memberInfo = members.find(m => m.userId === assigneeId);

        assignees.push({
          id: assigneeId.toString(),
          name: memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName}`.trim() || memberInfo.username || memberInfo.email : ((task as any).assigneeName || 'Unknown User'),
          email: memberInfo?.email || (task as any).assigneeEmail || '',
          avatar: memberInfo?.avatarUrl || undefined
        });
      }

      // Additional assignees
      const additionalAssignees = task.additionalAssignees || [];
      additionalAssignees.forEach((assignee: any) => {
        const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
        const memberInfo = members.find(m => m.userId === userId);

        assignees.push({
          id: assignee.id.toString(),
          name: memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName}`.trim() || memberInfo.username || memberInfo.email : assignee.name,
          email: memberInfo?.email || assignee.email || '',
          avatar: memberInfo?.avatarUrl || assignee.avatarUrl || assignee.avatar || undefined
        });
      });
    }

    return { assignees, assignedEmails: [] };
  };

  // Use useMemo to recalculate assignees when members or task data changes
  const { assignees, assignedEmails } = React.useMemo(() => {
    return getAllAssignees();
  }, [task, members, task.assigneeId, task.additionalAssignees, task.assignees]);

  // Handle click outside to close assignee list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAssigneeList(false);
      }
    };

    if (showAssigneeList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAssigneeList]);

  // Handle user selection (toggle selection)
  const handleUserToggle = (member: any) => {
    const newSelected = new Set(selectedAssignees);

    if (newSelected.has(member.userId)) {
      newSelected.delete(member.userId);
    } else {
      newSelected.add(member.userId);
    }

    setSelectedAssignees(newSelected);
  };

  // Handle saving the assignee changes
  const handleSaveAssignees = async () => {
    if (!onUpdateAssignees) return;

    const assigneesArray = Array.from(selectedAssignees);
    const primaryAssignee = assigneesArray.length > 0 ? assigneesArray[0] : null;
    const additionalAssignees = assigneesArray.slice(1);

    try {
      await onUpdateAssignees(task.id, primaryAssignee, additionalAssignees);
      setShowAssigneeList(false);
    } catch (error) {
      console.error('Failed to update assignees:', error);
    }
  };

  // Handle canceling changes
  const handleCancelChanges = () => {
    // Reset to original assignees
    const currentAssignees = new Set<number>();
    if (task.assigneeId) {
      currentAssignees.add(typeof task.assigneeId === 'string' ? parseInt(task.assigneeId) : task.assigneeId);
    }
    const additionalAssignees = (task as any).additionalAssignees || [];
    additionalAssignees.forEach((assignee: any) => {
      const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
      if (userId) currentAssignees.add(userId);
    });
    setSelectedAssignees(currentAssignees);
    setShowAssigneeList(false);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAssigneeList(true);
  };

  // Check if a user is currently selected
  const isUserSelected = (userId: number) => {
    return selectedAssignees.has(userId);
  };

  // Check if changes have been made
  const hasChanges = () => {
    const currentAssignees = new Set<number>();
    if (task.assigneeId) {
      currentAssignees.add(typeof task.assigneeId === 'string' ? parseInt(task.assigneeId) : task.assigneeId);
    }
    const additionalAssignees = (task as any).additionalAssignees || [];
    additionalAssignees.forEach((assignee: any) => {
      const userId = typeof assignee.id === 'string' ? parseInt(assignee.id) : assignee.id;
      if (userId) currentAssignees.add(userId);
    });

    if (currentAssignees.size !== selectedAssignees.size) return true;

    for (const userId of currentAssignees) {
      if (!selectedAssignees.has(userId)) return true;
    }
    return false;
  };

  return (
    <div className="w-[150px] px-4 relative" ref={containerRef}>
      <div className="flex items-center gap-1">
        {/* Display existing avatars */}
        {!showAssigneeList && (assignees.length > 0 || assignedEmails.length > 0) && (
          <div className="flex items-center -space-x-1">
            {/* Show assigned user avatars */}
            {assignees.slice(0, 3).map((assignee: any, index: number) => (
              <div key={`${assignee.id}-${index}`} className="relative">
                <UserAvatar
                  name={assignee.name}
                  avatar={assignee.avatar}
                  size="sm"
                  className="border-2 border-white"
                />
              </div>
            ))}

            {/* Show email-only assignments */}
            {assignedEmails.slice(0, Math.max(0, 3 - assignees.length)).map((email: string, index: number) => (
              <div key={`email-${index}`} className="relative">
                <UserAvatar
                  name={email}
                  size="sm"
                  className="border-2 border-white"
                />
              </div>
            ))}

            {/* Show "+X" if more than 3 assignees */}
            {(assignees.length + assignedEmails.length) > 3 && (
              <div
                className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white"
              >
                +{(assignees.length + assignedEmails.length) - 3}
              </div>
            )}
          </div>
        )}

        {/* Add button - always show */}
        <button
          onClick={handleAddClick}
          className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 hover:border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
          title="Assign task"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Project Members Dropdown */}
      {showAssigneeList && (
        <div
          className="absolute top-full left-0 mt-1 w-64 rounded-lg border shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}
        >
          <div className="p-2">
            <div className="text-xs font-medium mb-2" style={{ color: DARK_THEME.text.secondary }}>
              Project Members
            </div>

            {membersLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-xs" style={{ color: DARK_THEME.text.secondary }}>
                  Loading members...
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-xs text-red-400 mb-2">
                  Error: {error}
                </div>
                <div className="text-xs" style={{ color: DARK_THEME.text.secondary }}>
                  Project ID: {numericProjectId}
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-xs" style={{ color: DARK_THEME.text.secondary }}>
                  No project members found
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Project ID: {numericProjectId}
                </div>
                <div className="text-xs text-gray-500">
                  Members array: {JSON.stringify(members)}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    onClick={() => handleUserToggle(member)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      isUserSelected(member.userId) 
                        ? 'bg-blue-600/20 border border-blue-500' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <UserAvatar
                      name={`${member.firstName} ${member.lastName}`.trim() || member.username}
                      avatar={member.avatarUrl}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: DARK_THEME.text.primary }}>
                        {`${member.firstName} ${member.lastName}`.trim() || member.username}
                      </div>
                      <div className="text-xs truncate" style={{ color: DARK_THEME.text.secondary }}>
                        {member.email}
                      </div>
                    </div>
                    {member.isOnline && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    {isUserSelected(member.userId) && (
                      <Check size={14} className="text-green-400" />
                    )}
                  </div>
                ))}

                {/* Show selected count */}
                {selectedAssignees.size > 0 && (
                  <div className="text-xs text-center py-1" style={{ color: DARK_THEME.text.secondary }}>
                    {selectedAssignees.size} member{selectedAssignees.size !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            {/* Save/Cancel Actions */}
            {members.length > 0 && (
              <div className="flex justify-between items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor: DARK_THEME.border.default }}>
                <button
                  onClick={handleCancelChanges}
                  className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-500 transition-colors"
                  style={{ color: DARK_THEME.text.primary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignees}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    hasChanges() 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!hasChanges()}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
