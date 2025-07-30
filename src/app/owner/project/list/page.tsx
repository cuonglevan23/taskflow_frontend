'use client'
import React, { useState } from 'react'
import { Task } from '@/types/task'
import { CheckCircle, Plus, User, Calendar, MoreHorizontal, Move, ArrowRight, ChevronDown } from 'lucide-react'
import { ArrowUpDown, ListFilter, Search } from 'lucide-react'
import { Avatar } from '@/components/ui'
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup'

interface EditableTask extends Omit<Task, 'status'> {
  id: string
  status: 'TO_DO' | 'BLOCKED' | 'IN_PROGRESS' | 'TESTING' | 'DONE'
  isEditing?: {
    name?: boolean
    assignee?: boolean
    dueDate?: boolean
    priority?: boolean
    status?: boolean
  }
}

const assignees = [
  {
    id: '1',
    name: 'ducccdh.21it@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: '2',
    name: 'ducdsdaf.21it@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: '3',
    name: 'ducdâdh.21it@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '4',
    name: 'ducsdfdh.21it@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '5',
    name: 'ducdh.21it@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=6'
  },
  
]

const initialTasks: EditableTask[] = [
  {
    id: '1',
    name: 'fasdfsadf',
    assignee: ['ducdh.21it@gmail.com'],
    dueDate: '28 Jul',
    priority: 'Low',
    status: 'TO_DO'
  },
  {
    id: '2',
    name: 'ádfasdf',
    assignee: ['ducdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: 'TESTING'
  },
  {
    id: '3',
    name: 'sdfasdfasdf',
    assignee: ['ducdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: 'TO_DO'
  },
  {
    id: '4',
    name: 'sdfasdf',
    assignee: [],
    dueDate: '',
    priority: 'Low',
    status: 'TO_DO'
  },
  {
    id: '5',
    name: 'dsgfads',
    assignee: ['ducsdfdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: 'TO_DO'
  },
  {
    id: '6',
    name: 'hhsdfhfsd',
    assignee: [],
    dueDate: 'Tomorrow',
    priority: 'Medium',
    status: 'BLOCKED'
  },
  {
    id: '7',
    name: 'gggggg',
    assignee: [],
    dueDate: '25 Jul',
    priority: 'Low',
    status: 'TO_DO'
  },
  {
    id: '8',
    name: 'Share timeline with teammates',
    assignee: [],
    dueDate: '25 - 29 Jul',
    priority: 'High',
    status: 'IN_PROGRESS'
  }
]

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'TO_DO':
      return 'bg-blue-100 text-blue-800'
    case 'BLOCKED':
      return 'bg-red-300 text-red-800'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800'
    case 'TESTING':
      return 'bg-orange-100 text-orange-800'
    case 'DONE':
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

// TaskRow Component
const TaskRow = ({
  task,
  onEdit,
  onToggleEdit,
  onKeyPress
}: {
  task: EditableTask
  onEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onToggleEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status') => void
  onKeyPress: (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
}) => {
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
          <div className="relative">
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
              <User className="w-5 h-5 text-gray-400" />
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
              const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short'
              }) : '';
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
            <option value="TO_DO">TO_DO</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="TESTING">TESTING</option>
            <option value="DONE">DONE</option>
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

const ProjectListPage = () => {
  const [tasks, setTasks] = useState<EditableTask[]>(initialTasks)
  const [newTaskName, setNewTaskName] = useState('')

  const handleEdit = (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          [field]: value,
          isEditing: {
            ...task.isEditing,
            [field]: false
          }
        }
      }
      return task
    }))
  }

  const toggleEdit = (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          isEditing: {
            ...task.isEditing,
            [field]: !task.isEditing?.[field]
          }
        }
      }
      return task
    }))
  }

  const addNewTask = () => {
    if (newTaskName.trim()) {
      const newTask: EditableTask = {
        id: Date.now().toString(),
        name: newTaskName,
        assignee: [],
        dueDate: '',
        priority: 'Low',
        status: 'TO_DO'
      }
      setTasks(prev => [...prev, newTask])
      setNewTaskName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => {
    if (e.key === 'Enter') {
      handleEdit(taskId, field, value)
    } else if (e.key === 'Escape') {
      toggleEdit(taskId, field)
    }
  }

  return (
    <div className="pt-4 w-full px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mx-0 sm:mx-4 gap-2 sm:gap-0">
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1 rounded-md w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
        <div className="relative flex-grow max-w-full sm:max-w-sm mx-0 sm:mx-4 w-full">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-10 pr-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4" />
            <span className="hidden xs:inline">Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden xs:inline">Sort</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide max-h-[530px] mt-2">
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className='min-w-[200px] px-2 py-2'>Name</th>
              <th className='min-w-[130px] px-2 py-2'>Assignee</th>
              <th className='min-w-[100px] px-2 py-2'>Due date</th>
              <th className='min-w-[100px] px-2 py-2'>Priority</th>
              <th className='min-w-[100px] px-2 py-2'>Status</th>
              <th className='min-w-[70px] px-2 py-2'><Plus className="w-4 h-4" /></th>
            </tr>
          </thead>
          <tbody>
            {/* To Do Section Header */}
            <tr className='border-b border-gray-200'>
              <td colSpan={6} className='py-2 px-2 flex items-center gap-2 font-bold text-gray-500 hover:text-gray-700 cursor-pointer'>
                <ChevronDown className="w-4 h-4" /> To do
              </td>
            </tr>

            {/* Task Rows */}
            {tasks.filter(task => task.status === 'TO_DO').map((task, index) => (
              <TaskRow
                key={`todo-${task.id}`}
                task={task}
                onEdit={handleEdit}
                onToggleEdit={toggleEdit}
                onKeyPress={handleKeyPress}
              />
            ))}

            {/* Add New Task Row */}
            <tr className="border-b border-gray-200">
              <td className="min-w-[200px] py-1 px-2 border-r border-b border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add task..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addNewTask()
                      }
                    }}
                    className="w-full px-2 py-1 border border-transparent rounded text-sm focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </td>
              <td className="min-w-[130px] py-1 px-4 border border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-400" />
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Low
                </span>
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  TODO
                </span>
              </td>
              <td className="min-w-[70px] py-1 px-2 border-l border-b border-t border-gray-200"></td>
            </tr>

             <tr className='h-10'></tr>
            {/* Section In Progress */}
            <tr className='border-b border-gray-200 '>
              <td colSpan={6} className='py-2 px-2 flex items-center gap-2 font-bold text-gray-500 hover:text-gray-700 cursor-pointer'>
                <ChevronDown className="w-4 h-4" /> In Progress
              </td>
            </tr>

            {/* Task Rows */}
            {tasks.filter(task => task.status === 'IN_PROGRESS').map((task, index) => (
              <TaskRow
                key={`inprogress-${task.id}`}
                task={task}
                onEdit={handleEdit}
                onToggleEdit={toggleEdit}
                onKeyPress={handleKeyPress}
              />
            ))}

            {/* Add New Task Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-100">
              <td className="min-w-[200px] py-1 px-2  border-b border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add task..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addNewTask()
                      }
                    }}
                    className="w-full px-2 py-1 border border-transparent rounded text-sm focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </td>
              <td className="min-w-[130px] py-1 px-4 border border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-400" />
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Low
                </span>
              </td>
              <td className="min-w-[100px] py-1 px-2 border border-gray-200">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  TODO
                </span>
              </td>
              <td className="min-w-[70px] py-1 px-2 border-l border-b border-t border-gray-200"></td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectListPage