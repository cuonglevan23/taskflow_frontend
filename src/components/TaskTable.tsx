'use client'
import React from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { EditableTask, TaskStatus, Assignee } from '@/types/task'
import { TaskRow } from './TaskRow'
import { AddTaskRow } from './AddTaskRow'

interface TaskTableProps {
  tasks: EditableTask[]
  assignees: Assignee[]
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
  onEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onToggleEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status') => void
  onKeyPress: (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onAddTaskClick: (status: TaskStatus) => void
  onSetEditingNewTaskField: (field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null) => void
  onSetNewTaskData: (data: any) => void
  onAddNewTask: () => void
  onCancelAddTask: () => void
  onAddTaskKeyDown: (e: React.KeyboardEvent) => void
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  assignees,
  showAddTaskInput,
  addTaskStatus,
  newTaskData,
  editingNewTaskField,
  onEdit,
  onToggleEdit,
  onKeyPress,
  onAddTaskClick,
  onSetEditingNewTaskField,
  onSetNewTaskData,
  onAddNewTask,
  onCancelAddTask,
  onAddTaskKeyDown
}) => {
  return (
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
          {tasks.filter(task => task.status === TaskStatus.TO_DO).map((task, index) => (
            <TaskRow
              key={`todo-${task.id}`}
              task={task}
              assignees={assignees}
              onEdit={onEdit}
              onToggleEdit={onToggleEdit}
              onKeyPress={onKeyPress}
            />
          ))}

          {/* Add New Task Row */}
          <AddTaskRow
            showAddTaskInput={showAddTaskInput && addTaskStatus === TaskStatus.TO_DO}
            addTaskStatus={TaskStatus.TO_DO}
            newTaskData={newTaskData}
            editingNewTaskField={editingNewTaskField}
            assignees={assignees}
            onAddTaskClick={onAddTaskClick}
            onSetEditingNewTaskField={onSetEditingNewTaskField}
            onSetNewTaskData={onSetNewTaskData}
            onAddNewTask={onAddNewTask}
            onCancelAddTask={onCancelAddTask}
            onAddTaskKeyDown={onAddTaskKeyDown}
          />

          <tr className='h-10'></tr>
          
          {/* Section In Progress */}
          <tr className='border-b border-gray-200 '>
            <td colSpan={6} className='py-2 px-2 flex items-center gap-2 font-bold text-gray-500 hover:text-gray-700 cursor-pointer'>
              <ChevronDown className="w-4 h-4" /> In Progress
            </td>
          </tr>

          {/* Task Rows */}
          {tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).map((task, index) => (
            <TaskRow
              key={`inprogress-${task.id}`}
              task={task}
              assignees={assignees}
              onEdit={onEdit}
              onToggleEdit={onToggleEdit}
              onKeyPress={onKeyPress}
            />
          ))}

          {/* Add New Task Row */}
          <AddTaskRow
            showAddTaskInput={showAddTaskInput && addTaskStatus === TaskStatus.IN_PROGRESS}
            addTaskStatus={TaskStatus.IN_PROGRESS}
            newTaskData={newTaskData}
            editingNewTaskField={editingNewTaskField}
            assignees={assignees}
            onAddTaskClick={onAddTaskClick}
            onSetEditingNewTaskField={onSetEditingNewTaskField}
            onSetNewTaskData={onSetNewTaskData}
            onAddNewTask={onAddNewTask}
            onCancelAddTask={onCancelAddTask}
            onAddTaskKeyDown={onAddTaskKeyDown}
          />

        </tbody>
      </table>
    </div>
  )
} 