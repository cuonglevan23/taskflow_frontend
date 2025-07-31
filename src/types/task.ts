// types.ts
export enum TaskStatus {
  TO_DO = 'TO_DO',
  BLOCKED = 'BLOCKED',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  DONE = 'DONE'
}

export interface Task {
  id: string
  name: string
  assignee: string[]
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  status: TaskStatus
}

export interface EditableTask extends Omit<Task, 'status'> {
  id: string
  status: TaskStatus
  isEditing?: {
    name?: boolean
    assignee?: boolean
    dueDate?: boolean
    priority?: boolean
    status?: boolean
  }
}

export interface Assignee {
  id: string
  name: string
  avatar: string
}
  
  