import { useState } from 'react'
import { EditableTask, TaskStatus } from '@/types/task'

export const useTaskManagement = (initialTasks: EditableTask[]) => {
  const [tasks, setTasks] = useState<EditableTask[]>(initialTasks)
  const [showAddTaskInput, setShowAddTaskInput] = useState(false)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus>(TaskStatus.TO_DO)
  const [newTaskData, setNewTaskData] = useState({
    name: '',
    assignee: [] as string[],
    dueDate: '',
    priority: 'Low' as 'Low' | 'Medium' | 'High',
    status: TaskStatus.TO_DO
  })
  const [editingNewTaskField, setEditingNewTaskField] = useState<'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null>(null)

  const handleEdit = (taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: string | Date) => {
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
    if (newTaskData.name.trim()) {
      const newTask: EditableTask = {
        id: Date.now().toString(),
        name: newTaskData.name,
        assignee: newTaskData.assignee,
        dueDate: newTaskData.dueDate,
        priority: newTaskData.priority,
        status: newTaskData.status
      }
      setTasks(prev => [...prev, newTask])
      setNewTaskData({
        name: '',
        assignee: [],
        dueDate: '',
        priority: 'Low',
        status: TaskStatus.TO_DO
      })
      setShowAddTaskInput(false)
      setEditingNewTaskField(null)
    }
  }

  const handleAddTaskClick = (status: TaskStatus) => {
    setAddTaskStatus(status)
    setNewTaskData(prev => ({ ...prev, status }))
    setShowAddTaskInput(true)
  }

  const handleCancelAddTask = () => {
    setShowAddTaskInput(false)
    setNewTaskData({
      name: '',
      assignee: [],
      dueDate: '',
      priority: 'Low',
      status: TaskStatus.TO_DO
    })
    setEditingNewTaskField(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: string | Date) => {
    if (e.key === 'Enter') {
      handleEdit(taskId, field, value)
    } else if (e.key === 'Escape') {
      toggleEdit(taskId, field)
    }
  }

  const handleAddTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNewTask()
    } else if (e.key === 'Escape') {
      handleCancelAddTask()
    }
  }

  return {
    tasks,
    showAddTaskInput,
    addTaskStatus,
    newTaskData,
    editingNewTaskField,
    handleEdit,
    toggleEdit,
    addNewTask,
    handleAddTaskClick,
    handleCancelAddTask,
    handleKeyPress,
    handleAddTaskKeyDown,
    setNewTaskData,
    setEditingNewTaskField
  }
} 