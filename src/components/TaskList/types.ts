import { TaskStatus } from '@/types/task'

export type NewTaskDataType = {
  name: string
  assignee: string[]
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  status: TaskStatus
} 