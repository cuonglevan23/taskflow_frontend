import React, { useState } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskPriorityProps {
  task: TaskListItem | null;
  onTaskPriorityChange?: (taskId: string, priority: string) => void;
}

export const TaskPriority: React.FC<TaskPriorityProps> = ({
  task,
  onTaskPriorityChange
}) => {
  const [isEditingPriority, setIsEditingPriority] = useState(false);

  const handlePriorityChange = (newPriority: string) => {
    if (task && onTaskPriorityChange) {
      onTaskPriorityChange(task.id, newPriority);
    }
    setIsEditingPriority(false);
  };

  return (
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
  );
};

interface TaskStatusProps {
  task: TaskListItem | null;
  onTaskStatusChange?: (taskId: string, status: string) => void;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({
  task,
  onTaskStatusChange
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (task && onTaskStatusChange) {
      onTaskStatusChange(task.id, newStatus);
    }
    setIsEditingStatus(false);
  };

  return (
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
  );
};
