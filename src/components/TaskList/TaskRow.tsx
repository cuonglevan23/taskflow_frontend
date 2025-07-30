import React, { useRef, useEffect } from 'react'
import { CheckCircle, User, Calendar, MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui'
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup'
import { EditableTask, TaskStatus, Assignee } from '@/types/task'
import { getPriorityColor, getStatusColor, getDueDateColor, formatDate } from './utils'

interface TaskRowProps {
  task: EditableTask
  assignees: Assignee[]
  onEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onToggleEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status') => void
  onKeyPress: (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  assignees,
  onEdit,
  onToggleEdit,
  onKeyPress
}) => {
  const assigneeDropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        if (task.isEditing?.assignee) {
          onToggleEdit(task.id, 'assignee')
        }
      }
    }

    if (task.isEditing?.assignee) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [task.isEditing?.assignee, task.id, onToggleEdit])

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-100`}>
      {/* Name Column */}
      <td className="min-w-[200px] py-1 px-2 border-b border-t border-gray-200 ">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gray-400" />
          {task.isEditing?.name ? (
            <input
              type="text"
              value={task.name}
              onChange={(e) => {
                // Update task name in parent component
                const updatedTask = { ...task, name: e.target.value }
                // You'll need to implement this in parent
              }}
              onBlur={() => onEdit(task.id, 'name', task.name)}
              onKeyDown={(e) => onKeyPress(e, task.id, 'name', task.name)}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 hover:border-gray-800 transition-all duration-200"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => onToggleEdit(task.id, 'name')}
            >
              {task.name}
            </span>
          )}
        </div>
      </td>

      {/* Assignee Column */}
      <td className="min-w-[180px] py-1 px-2 border border-gray-200">
        {task.isEditing?.assignee ? (
          <div className="relative" ref={assigneeDropdownRef}>
            <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-md w-64 p-2 max-h-48 overflow-y-auto space-y-1">
              {assignees.map((assignee) => {
                const isSelected = task.assignee.includes(assignee.name);
                return (
                  <label
                    key={assignee.id}
                    className={` w-full flex items-center gap-2  py-1 rounded cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelection = e.target.checked
                          ? [...task.assignee, assignee.name]
                          : task.assignee.filter(name => name !== assignee.name);
                        onEdit(task.id, 'assignee', newSelection);
                      }}
                    />
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm w-full">{assignee.name}</span>
                  </label>
                );
              })}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => onToggleEdit(task.id, 'assignee')}
                  className="text-sm px-2 py-1 rounded border hover:bg-gray-100"
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => onToggleEdit(task.id, 'assignee')}
          >
            {task.assignee.length > 0 ? (
              <div className="flex items-center gap-2 w-full">
                <AvatarGroup
                  users={task.assignee.map(assigneeName => {
                    const assignee = assignees.find(a => a.name === assigneeName);
                    return {
                      name: assigneeName,
                      src: assignee?.avatar
                    };
                  })}
                  maxVisible={2}
                />
                <span className="text-sm w-full">{task.assignee[0]}</span>
              </div>
            ) : (
              <User className="w-6 h-6 text-gray-500 border border-gray-400 rounded-full p-1 ml-1 hover:border-gray-500 hover:text-gray-700" />
            )}
          </div>
        )}
      </td>

      {/* Due Date Column */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.dueDate ? (
          <input
            type="date"
            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const selectedDate = e.target.value;
              const formattedDate = selectedDate ? formatDate(selectedDate) : '';
              onEdit(task.id, 'dueDate', formattedDate);
            }}
            onBlur={() => onToggleEdit(task.id, 'dueDate')}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={`flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm ${getDueDateColor(task.dueDate)}`}
            onClick={() => onToggleEdit(task.id, 'dueDate')}
          >
            {task.dueDate ? (
              <>
                <Calendar className="w-4 h-4" />
                {task.dueDate}
              </>
            ) : (
              <Calendar className="w-4 h-4 text-gray-400" />
            )}
          </span>
        )}
      </td>

      {/* Priority Column */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.priority ? (
          <select
            value={task.priority}
            onChange={(e) => onEdit(task.id, 'priority', e.target.value)}
            onBlur={() => onToggleEdit(task.id, 'priority')}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)}`}
            onClick={() => onToggleEdit(task.id, 'priority')}
          >
            {task.priority}
          </span>
        )}
      </td>

      {/* Status Column */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.status ? (
          <select
            value={task.status}
            onChange={(e) => onEdit(task.id, 'status', e.target.value)}
            onBlur={() => onToggleEdit(task.id, 'status')}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            <option value={TaskStatus.TO_DO}>TO_DO</option>
            <option value={TaskStatus.BLOCKED}>BLOCKED</option>
            <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
            <option value={TaskStatus.TESTING}>TESTING</option>
            <option value={TaskStatus.DONE}>DONE</option>
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusColor(task.status)}`}
            onClick={() => onToggleEdit(task.id, 'status')}
          >
            {task.status}
          </span>
        )}
      </td>

      {/* Actions Column */}
      <td className="min-w-[70px] py-1 px-2 border-l border-b border-t border-gray-200">
        <div className="flex items-center gap-1">
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </td>
    </tr>
  )
}

export default TaskRow 