import React from 'react'
import { CheckCircle, ChevronDown } from 'lucide-react'
import { EditableTask, TaskStatus, Assignee } from '@/types/task'
import TaskRow from './TaskRow'
import AddTaskRow from './AddTaskRow'
import { NewTaskDataType } from './types'

interface TaskSectionProps {
  title: string
  status: TaskStatus
  tasks: EditableTask[]
  assignees: Assignee[]
  showAddTaskInput: boolean
  addTaskStatus: TaskStatus | null
  newTaskData: NewTaskDataType
  editingNewTaskField: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null
  onEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onToggleEdit: (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status') => void
  onKeyPress: (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => void
  onAddTaskClick: (status: TaskStatus) => void
  onNewTaskDataChange: (field: keyof NewTaskDataType, value: any) => void
  onEditingFieldChange: (field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null) => void
  onAddTask: () => void
  onCancelAddTask: () => void
  onAddTaskKeyDown: (e: React.KeyboardEvent) => void
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  status,
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
  onNewTaskDataChange,
  onEditingFieldChange,
  onAddTask,
  onCancelAddTask,
  onAddTaskKeyDown
}) => {
  const filteredTasks = tasks.filter(task => task.status === status)
  const isAddingTask = showAddTaskInput && addTaskStatus === status

  return (
    <>
      {/* Section Header */}
      <tr className='border-b border-gray-200'>
        <td colSpan={6} className='py-2 px-2 flex items-center gap-2 font-bold text-gray-500 hover:text-gray-700 cursor-pointer'>
          <ChevronDown className="w-4 h-4" /> {title}
        </td>
      </tr>

      {/* Task Rows */}
      {filteredTasks.map((task) => (
        <TaskRow
          key={`${status}-${task.id}`}
          task={task}
          assignees={assignees}
          onEdit={onEdit}
          onToggleEdit={onToggleEdit}
          onKeyPress={onKeyPress}
        />
      ))}

      {/* Add New Task Row */}
      {isAddingTask ? (
        <AddTaskRow
          newTaskData={newTaskData}
          assignees={assignees}
          editingNewTaskField={editingNewTaskField}
          onNewTaskDataChange={onNewTaskDataChange}
          onEditingFieldChange={onEditingFieldChange}
          onAddTask={onAddTask}
          onCancelAddTask={onCancelAddTask}
          onKeyDown={onAddTaskKeyDown}
        />
      ) : (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td 
            colSpan={6}
            className="min-w-[200px] py-1 px-2 border-b border-t border-gray-200 cursor-pointer"
            onClick={() => onAddTaskClick(status)}
          >
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700 py-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Add task...</span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TaskSection 