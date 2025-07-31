import { EditableTask, Assignee, TaskStatus } from '@/types/task'

export const mockAssignees: Assignee[] = [
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

export const mockTasks: EditableTask[] = [
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