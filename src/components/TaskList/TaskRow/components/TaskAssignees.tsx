import React from 'react';
import { Plus } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState, MockUser } from '../types';
import Input from '@/components/ui/Input/Input';
import Avatar from '@/components/ui/Avatar/Avatar';
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup';

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

  onStartAddAssignee,

}: TaskAssigneesProps) => {


  return (
    <div className="w-[150px] px-4">
      <div className="flex items-center gap-1">


                <button
                  className="w-4 h-4 rounded-full border border-gray-600 border-dashed flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-700/50 transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartAddAssignee();
                  }}
                  title="Add more assignees"
                >
                  <Plus className="w-2 h-2 text-gray-500" />
                </button>
              </div>



    </div>
  );
};