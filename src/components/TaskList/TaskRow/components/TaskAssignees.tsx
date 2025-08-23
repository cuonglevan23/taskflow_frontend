import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState, MockUser } from '../types';
import Avatar from '@/components/ui/Avatar/Avatar';

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
  const [emailInput, setEmailInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  console.log('🎯 TaskAssignees rendering:', {
    taskId: task.id,
    taskName: task.name,
    assignedEmails: (task as any).assignedEmails,
    hasAssignedEmails: !!((task as any).assignedEmails) && ((task as any).assignedEmails).length > 0,
    assigneesCount: task.assignees?.length || 0
  });

  // Handle click outside to close input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowInput(false);
        setEmailInput('');
      }
    };

    if (showInput) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showInput]);

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    console.log('⌨️ Key pressed:', e.key, 'Email:', emailInput);
    if (e.key === 'Enter') {
      if (emailInput.trim() && emailInput.includes('@')) {
        console.log('✅ Enter pressed with valid email, calling onInviteUser');
        onInviteUser(emailInput.trim());
        setEmailInput('');
        setShowInput(false);
      } else {
        console.log('❌ Enter pressed with invalid email:', emailInput);
      }
    } else if (e.key === 'Escape') {
      setEmailInput('');
      setShowInput(false);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInput(true);
  };

  const assignedEmails = (task as any).assignedEmails || [];

  return (
    <div className="w-[150px] px-4">
      <div className="flex items-center gap-1">
        {/* Display existing avatars - only when input is not shown */}
        {!showInput && (task.assignees?.length > 0 || assignedEmails.length > 0) && (
          <div className="flex items-center -space-x-1">
            {/* Existing assignees avatars */}
            {task.assignees && task.assignees.slice(0, 2).map((assignee, index) => (
              <Avatar
                key={assignee.id || index}
                name={assignee.name}
                size="sm"
                className="w-8 h-8 border border-gray-600"
              />
            ))}
            
            {/* Email assignees avatars */}
            {assignedEmails.slice(0, 2).map((email: string) => (
              <div key={email} title={email}>
                <Avatar
                  name={email}
                  size="sm"
                  className="w-8 h-8 border border-blue-500"
                />
              </div>
            ))}
            
            {/* Show count if too many */}
            {((task.assignees?.length || 0) + assignedEmails.length) > 4 && (
              <div 
                className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border border-gray-600"
                title={`+${((task.assignees?.length || 0) + assignedEmails.length) - 4} more`}
              >
                +{((task.assignees?.length || 0) + assignedEmails.length) - 4}
              </div>
            )}
          </div>
        )}

        {/* Add button or Input */}
        {showInput ? (
          <div ref={inputContainerRef} className="relative flex items-center ml-1">
            {/* Avatars inside input */}
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 flex -space-x-1 z-10">
              {/* Existing assignees avatars */}
              {task.assignees && task.assignees.slice(0, 2).map((assignee, index) => (
                <Avatar
                  key={assignee.id || index}
                  name={assignee.name}
                  size="sm"
                  className="w-5 h-5 border border-gray-600"
                />
              ))}
              
              {/* Email assignees avatars */}
              {assignedEmails.slice(0, 2).map((email: string) => (
                <div key={email} title={email}>
                  <Avatar
                    name={email}
                    size="sm"
                    className="w-5 h-5 border border-blue-500"
                  />
                </div>
              ))}
              
              {/* Show count if too many */}
              {((task.assignees?.length || 0) + assignedEmails.length) > 4 && (
                <div 
                  className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border border-gray-600"
                  title={`+${((task.assignees?.length || 0) + assignedEmails.length) - 4} more`}
                >
                  +{((task.assignees?.length || 0) + assignedEmails.length) - 4}
                </div>
              )}
            </div>
            
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              placeholder="Add email..."
              className={`text-xs bg-gray-700 text-white border border-gray-600 rounded py-1 pr-2 focus:outline-none focus:border-blue-400 placeholder-gray-400 ${
                ((task.assignees?.length || 0) + assignedEmails.length) > 0
                  ? `pl-${Math.min(((task.assignees?.length || 0) + assignedEmails.length) * 3 + 4, 16)} w-32`
                  : 'pl-2 w-24'
              }`}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-4 h-4 rounded-full border border-gray-600 border-dashed flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-700/50 transition-all opacity-0 group-hover:opacity-100 ml-1"
            title="Add assignee by email"
          >
            <Plus className="w-2 h-2 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};