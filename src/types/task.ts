// types.ts
export interface Task {
    name: string
    assignee: string
    dueDate: string
    priority: 'Low' | 'Medium' | 'High'
    status: 'On track' | 'Off track' | 'In progress'
  }
  