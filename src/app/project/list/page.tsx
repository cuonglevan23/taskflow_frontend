
'use client'
import React, { useState } from 'react'
import { EditableTask, TaskStatus, Assignee } from '@/types/task'
import { TaskTable, TaskHeader } from '@/components/TaskList'

const assignees: Assignee[] = [
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
    status: TaskStatus.TO_DO
  },
  {
    id: '2',
    name: 'ádfasdf',
    assignee: ['ducdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: TaskStatus.TESTING
  },
  {
    id: '3',
    name: 'sdfasdfasdf',
    assignee: ['ducdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: TaskStatus.TO_DO
  },
  {
    id: '4',
    name: 'sdfasdf',
    assignee: [],
    dueDate: '',
    priority: 'Low',
    status: TaskStatus.TO_DO
  },
  {
    id: '5',
    name: 'dsgfads',
    assignee: ['ducsdfdh.21it@gmail.com'],
    dueDate: '',
    priority: 'Low',
    status: TaskStatus.TO_DO
  },
  {
    id: '6',
    name: 'hhsdfhfsd',
    assignee: [],
    dueDate: 'Tomorrow',
    priority: 'Medium',
    status: TaskStatus.BLOCKED
  },
  {
    id: '7',
    name: 'gggggg',
    assignee: [],
    dueDate: '25 Jul',
    priority: 'Low',
    status: TaskStatus.TO_DO
  },
  {
    id: '8',
    name: 'Share timeline with teammates',
    assignee: [],
    dueDate: '25 - 29 Jul',
    priority: 'High',
    status: TaskStatus.IN_PROGRESS
  }
]

const ProjectListPage = () => {
  const [tasks, setTasks] = useState<EditableTask[]>(initialTasks)
  const [showAddTaskInput, setShowAddTaskInput] = useState(false)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null)
  const [newTaskData, setNewTaskData] = useState({
    name: '',
    assignee: [] as string[],
    dueDate: '',
    priority: 'Low' as 'Low' | 'Medium' | 'High',
    status: TaskStatus.TO_DO
  })
  const [editingNewTaskField, setEditingNewTaskField] = useState<'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null>(null)

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
      setAddTaskStatus(null)
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
    setAddTaskStatus(null)
    setNewTaskData({
      name: '',
      assignee: [],
      dueDate: '',
      priority: 'Low',
      status: TaskStatus.TO_DO
    })
    setEditingNewTaskField(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string, field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status', value: any) => {
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

  const handleNewTaskDataChange = (field: keyof typeof newTaskData, value: any) => {
    setNewTaskData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditingFieldChange = (field: 'name' | 'assignee' | 'dueDate' | 'priority' | 'status' | null) => {
    setEditingNewTaskField(field)
  }

  const handleHeaderAddTask = () => {
    // This could open a modal or navigate to a different page
    console.log('Add task from header clicked')
  }

  return (
    <div className="pt-4 w-full px-2 sm:px-4">
      <TaskHeader onAddTask={handleHeaderAddTask} />

      <TaskTable
        tasks={tasks}
        assignees={assignees}
        showAddTaskInput={showAddTaskInput}
        addTaskStatus={addTaskStatus}
        newTaskData={newTaskData}
        editingNewTaskField={editingNewTaskField}
        onEdit={handleEdit}
        onToggleEdit={toggleEdit}
        onKeyPress={handleKeyPress}
        onAddTaskClick={handleAddTaskClick}
        onNewTaskDataChange={handleNewTaskDataChange}
        onEditingFieldChange={handleEditingFieldChange}
        onAddTask={addNewTask}
        onCancelAddTask={handleCancelAddTask}
        onAddTaskKeyDown={handleAddTaskKeyDown}
      />
    </div>
  );
};

export default ProjectListPage;