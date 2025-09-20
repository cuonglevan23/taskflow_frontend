import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState, MockUser } from '../types';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { UserEmailLookup } from '@/components/User/UserEmailLookup';
import { UserLookupDto } from '@/types/user-lookup';
import { DARK_THEME } from '@/constants/theme';

interface TaskAssigneesProps {
  task: TaskListItem;
  editState: TaskEditState;
  onStartAddAssignee: () => void;
  onCancelAssignee: () => void;
  onSelectUser: (user: MockUser) => void;
  onInviteUser: (email: string) => void;
  onUpdateAssigneeInput: (value: string) => void;
}

export const TaskAssignees = ({
  task,
  editState,
  onStartAddAssignee,
  onCancelAssignee,
  onSelectUser,
  onInviteUser,
  onUpdateAssigneeInput,
}: TaskAssigneesProps) => {
  const [showLookup, setShowLookup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to get all assignees from different sources
  const getAllAssignees = () => {
    const assignees = task.assignees || [];
    const assignedEmails = (task as any).assignedEmails || [];
    const assigneeProfiles = (task as any).assigneeProfiles || [];

    // If assignees is empty but assigneeProfiles exists, transform it
    if (assignees.length === 0 && assigneeProfiles.length > 0) {
      const transformedAssignees = assigneeProfiles.map((profile: any) => ({
        id: profile.userId?.toString() || '',
        name: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Unknown',
        email: profile.email,
        avatar: profile.avatarUrl || undefined
      }));
      return { assignees: transformedAssignees, assignedEmails };
    }

    return { assignees, assignedEmails };
  };

  const { assignees, assignedEmails } = getAllAssignees();


  // Handle click outside to close lookup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLookup(false);
      }
    };

    if (showLookup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLookup]);

  // Handle user selection from lookup
  const handleUserSelect = (user: UserLookupDto) => {
    const mockUser: MockUser = {
      id: user.userId.toString(),
      name: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || user.email,
      email: user.email,
      avatar: user.avatarUrl || ''
    };
    onSelectUser(mockUser);
    setShowLookup(false);
  };

  // Handle email invite
  const handleEmailInvite = (email: string) => {
    onInviteUser(email);
    setShowLookup(false);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLookup(true);
  };

  return (
    <div className="w-[150px] px-4 relative" ref={containerRef}>
      <div className="flex items-center gap-1">
        {/* Display existing avatars */}
        {!showLookup && (assignees.length > 0 || assignedEmails.length > 0) && (
          <div className="flex items-center -space-x-1">
            {/* Existing assignees avatars */}
            {assignees && assignees.slice(0, 2).map((assignee, index) => {
              return (
                <UserAvatar
                  key={assignee.id || index}
                  name={assignee.name}
                  avatar={assignee.avatar}
                  email={assignee.email}
                  size="sm"
                  className="w-8 h-8 border border-gray-600"
                />
              );
            })}
            
            {/* Email assignees avatars */}
            {assignedEmails
              .filter((email: string) => {
                return !assignees.some(assignee => assignee.email === email);
              })
              .slice(0, 2)
              .map((email: string) => (
                <div key={email} title={email}>
                  <UserAvatar
                    name={email}
                    size="sm"
                    className="w-8 h-8 border border-gray-600"
                    email={email}
                  />
                </div>
              ))}

            {/* Show count if more than 2 */}
            {(assignees.length || 0) + assignedEmails.length > 2 && (
              <div
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: DARK_THEME.background.secondary,
                  color: DARK_THEME.text.secondary
                }}
              >
                +{(assignees.length || 0) + assignedEmails.length - 2}
              </div>
            )}
          </div>
        )}

        {/* Show UserEmailLookup inline or Add button */}
        {showLookup ? (
          <div className="absolute left-0 z-10" style={{ width: '200px' }}>
            <UserEmailLookup
              onUserSelect={handleUserSelect}
              onEmailInvite={handleEmailInvite}
              placeholder="Search users..."
              autoFocus={true}
              showSelectedUsers={false}
              className="w-full text-sm border rounded-md px-2 py-1"
              style={{
                backgroundColor: DARK_THEME.background.primary,
                borderColor: DARK_THEME.border.default,
                color: DARK_THEME.text.primary
              }}
            />
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-8 h-8 rounded-full border border-dashed flex items-center justify-center hover:border-gray-300 transition-colors"
            style={{ borderColor: DARK_THEME.border.default }}
            title="Assign user or invite by email"
          >
            <Plus className="w-4 h-4" style={{ color: DARK_THEME.text.secondary }} />
          </button>
        )}
      </div>
    </div>
  );
};