'use client'
import React from 'react'
import { CheckCircle, User, Calendar } from 'lucide-react'
import { TaskStatus, Assignee } from '@/types/task'
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup'

interface AddTaskRowProps {
  showAddTaskInput: boolean
  addTaskStatus: TaskStatus
  newTaskData: {
    name: string
    assignee: string[]
    dueDate: string
    priority: 'Low' | 'Medium' | 'High'
    status: TaskStatus
  }
  editingNewTaskField: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null
  assignees: Assignee[]
  onAddTaskClick: (status: TaskStatus) => void
  onSetEditingNewTaskField: (field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null) => void
  onSetNewTaskData: (data: any) => void
  onAddNewTask: () => void
  onCancelAddTask: () => void
  onAddTaskKeyDown: (e: React.KeyboardEvent) => void
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-purple-100 text-purple-800'
    case 'Medium':
      return 'bg-orange-100 text-orange-800'
    case 'Low':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-green-100 text-green-800'
  }
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TO_DO:
      return 'bg-blue-100 text-blue-800'
    case TaskStatus.BLOCKED:
      return 'bg-red-300 text-red-800'
    case TaskStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800'
    case TaskStatus.TESTING:
      return 'bg-orange-100 text-orange-800'
    case TaskStatus.DONE:
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getDueDateColor = (dueDate: string) => {
  if (dueDate.includes('Jul') && dueDate !== 'Tomorrow') {
    return 'text-red-600'
  }
  if (dueDate === 'Tomorrow') {
    return 'text-green-600'
  }
  return 'text-gray-900'
}

export const AddTaskRow: React.FC<AddTaskRowProps> = ({
  showAddTaskInput,
  addTaskStatus,
  newTaskData,
  editingNewTaskField,
  assignees,
  onAddTaskClick,
  onSetEditingNewTaskField,
  onSetNewTaskData,
  onAddNewTask,
  onCancelAddTask,
  onAddTaskKeyDown
}) => {
  if (showAddTaskInput) {
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
                onChange={(e) => onSetNewTaskData({ ...newTaskData, name: e.target.value })}
                onKeyDown={onAddTaskKeyDown}
                onBlur={() => onSetEditingNewTaskField(null)}
                className="w-full px-2 py-1 border border-transparent rounded text-sm focus:outline-none focus:border-blue-500 transition-all duration-200"
                autoFocus
              />
            ) : (
              <span
                className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
                onClick={() => onSetEditingNewTaskField('name')}
              >
                {newTaskData.name || 'Add task...'}
              </span>
            )}
          </div>
        </td>
        <td className="min-w-[130px] py-1 px-4 border border-gray-200">
          {editingNewTaskField === 'assignee' ? (
            <div className="relative">
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
                          onSetNewTaskData({ ...newTaskData, assignee: newSelection });
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
                    onClick={() => onSetEditingNewTaskField(null)}
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
              onClick={() => onSetEditingNewTaskField('assignee')}
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
                const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short'
                }) : '';
                onSetNewTaskData({ ...newTaskData, dueDate: formattedDate });
              }}
              onBlur={() => onSetEditingNewTaskField(null)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <span
              className={`flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm ${getDueDateColor(newTaskData.dueDate)}`}
              onClick={() => onSetEditingNewTaskField('dueDate')}
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
              onChange={(e) => onSetNewTaskData({ ...newTaskData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
              onBlur={() => onSetEditingNewTaskField(null)}
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
              onClick={() => onSetEditingNewTaskField('priority')}
            >
              {newTaskData.priority}
            </span>
          )}
        </td>
        <td className="min-w-[100px] py-1 px-2 border border-gray-200">
          {editingNewTaskField === 'status' ? (
            <select
              value={newTaskData.status}
              onChange={(e) => onSetNewTaskData({ ...newTaskData, status: e.target.value as TaskStatus })}
              onBlur={() => onSetEditingNewTaskField(null)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            >
              <option value={TaskStatus.TO_DO}>TO_DO</option>
              <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
            </select>
          ) : (
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusColor(newTaskData.status)}`}
              onClick={() => onSetEditingNewTaskField('status')}
            >
              {newTaskData.status}
            </span>
          )}
        </td>
        <td className="min-w-[70px] py-1 px-2 border-l border-b border-t border-gray-200">
          <div className="flex items-center gap-1">
            <button
              onClick={onAddNewTask}
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

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td 
        colSpan={6}
        className="min-w-[200px] py-1 px-2 border-b border-t border-gray-200 cursor-pointer"
        onClick={() => onAddTaskClick(addTaskStatus)}
      >
        <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700 py-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Add task...</span>
        </div>
      </td>
    </tr>
  )
} 