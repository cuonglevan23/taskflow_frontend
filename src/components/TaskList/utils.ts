import { TaskStatus } from '@/types/task'

export const getPriorityColor = (priority: string) => {
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

export const getStatusColor = (status: TaskStatus) => {
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

export const getDueDateColor = (dueDate: string) => {
  if (dueDate.includes('Jul') && dueDate !== 'Tomorrow') {
    return 'text-red-600'
  }
  if (dueDate === 'Tomorrow') {
    return 'text-green-600'
  }
  return 'text-gray-900'
}

export const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  })
} 