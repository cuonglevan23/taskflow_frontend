import React, { useRef, useEffect } from 'react'
import { CheckCircle, User, Calendar } from 'lucide-react'
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup'
import { TaskStatus, Assignee } from '@/types/task'
import { getPriorityColor, getStatusColor, getDueDateColor, formatDate } from './utils'
import { NewTaskDataType } from './types'

interface AddTaskRowProps {
  newTaskData: NewTaskDataType
  assignees: Assignee[]
  editingNewTaskField: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null
  onNewTaskDataChange: (field: keyof NewTaskDataType, value: any) => void
  onEditingFieldChange: (field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null) => void
  onAddTask: () => void
  onCancelAddTask: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

const AddTaskRow: React.FC<AddTaskRowProps> = ({
  newTaskData,
  assignees,
  editingNewTaskField,
  onNewTaskDataChange,
  onEditingFieldChange,
  onAddTask,
  onCancelAddTask,
  onKeyDown
}) => {
  const assigneeDropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        if (editingNewTaskField === 'assignee') {
          onEditingFieldChange(null)
        }
      }
    }

    if (editingNewTaskField === 'assignee') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingNewTaskField, onEditingFieldChange])

  return (
    <tr className="border-b border-gray-200 p-2">
      <td className="min-w-[200px] py-1 px-2 border-r border-b border-t border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gray-400" />
          {editingNewTaskField === 'name' ? (
            <input
              type="text"
              placeholder="Add task..."
              value={newTaskData.name}
              onChange={(e) => onNewTaskDataChange('name', e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => onEditingFieldChange(null)}
              className="w-full px-2 py-1 border border-transparent rounded text-sm focus:outline-none focus:border-blue-500 transition-all duration-200"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
              onClick={() => onEditingFieldChange('name')}
            >
              {newTaskData.name || 'Add task...'}
            </span>
          )}
        </div>
      </td>
      <td className="min-w-[130px] py-1 px-4 border border-gray-200">
        {editingNewTaskField === 'assignee' ? (
          <div className="relative" ref={assigneeDropdownRef}>
            <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-md w-64 p-2 max-h-48 overflow-y-auto space-y-1">
              {assignees.map((assignee) => {
                const isSelected = newTaskData.assignee.includes(assignee.name);
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
                          ? [...newTaskData.assignee, assignee.name]
                          : newTaskData.assignee.filter(name => name !== assignee.name);
                        onNewTaskDataChange('assignee', newSelection);
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
                  onClick={() => onEditingFieldChange(null)}
                  className="text-sm px-2 py-1 rounded border hover:bg-gray-100"
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-1 py-1 rounded"
            onClick={() => onEditingFieldChange('assignee')}
          >
            {newTaskData.assignee.length > 0 ? (
              <div className="flex items-center gap-2 w-full">
                <AvatarGroup
                  users={newTaskData.assignee.map(assigneeName => {
                    const assignee = assignees.find(a => a.name === assigneeName);
                    return {
                      name: assigneeName,
                      src: assignee?.avatar
                    };
                  })}
                  maxVisible={2}
                />
                <span className="text-sm w-full">{newTaskData.assignee[0]}</span>
              </div>
            ) : (
              <User className="w-6 h-6 text-gray-500 border border-gray-400 rounded-full p-1 hover:border-gray-500 hover:text-gray-700" />
            )}
          </div>
        )}
      </td>
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {editingNewTaskField === 'dueDate' ? (
          <input
            type="date"
            value={newTaskData.dueDate ? new Date(newTaskData.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const selectedDate = e.target.value;
              const formattedDate = selectedDate ? formatDate(selectedDate) : '';
              onNewTaskDataChange('dueDate', formattedDate);
            }}
            onBlur={() => onEditingFieldChange(null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={`flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm ${getDueDateColor(newTaskData.dueDate)}`}
            onClick={() => onEditingFieldChange('dueDate')}
          >
            {newTaskData.dueDate ? (
              <>
                <Calendar className="w-4 h-4" />
                {newTaskData.dueDate}
              </>
            ) : (
              <Calendar className="w-4 h-4 text-gray-400" />
            )}
          </span>
        )}
      </td>
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {editingNewTaskField === 'priority' ? (
          <select
            value={newTaskData.priority}
            onChange={(e) => onNewTaskDataChange('priority', e.target.value)}
            onBlur={() => onEditingFieldChange(null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getPriorityColor(newTaskData.priority)}`}
            onClick={() => onEditingFieldChange('priority')}
          >
            {newTaskData.priority}
          </span>
        )}
      </td>
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {editingNewTaskField === 'status' ? (
          <select
            value={newTaskData.status}
            onChange={(e) => onNewTaskDataChange('status', e.target.value)}
            onBlur={() => onEditingFieldChange(null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            <option value={TaskStatus.TO_DO}>TO_DO</option>
            <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusColor(newTaskData.status)}`}
            onClick={() => onEditingFieldChange('status')}
          >
            {newTaskData.status}
          </span>
        )}
      </td>
      <td className="min-w-[70px] py-1 px-2 border-l border-b border-t border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={onAddTask}
            className="text-sm px-2 py-1 rounded border bg-blue-500 text-white hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={onCancelAddTask}
            className="text-sm px-2 py-1 rounded border bg-gray-500 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}

export default AddTaskRow 