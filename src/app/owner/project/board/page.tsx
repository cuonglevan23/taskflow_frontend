import React from 'react'
import TaskBoard from './TaskBoard'
import { Task, TaskStatus, Assignee } from '../../../../types/task'

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
const sampleData: { title: string; tasks: Task[] }[] = [
  {
    title: 'To do',
    tasks: [
      {
        id: '1',
        name: 'Task 1',
        assignee: ['ducccdh.21it@gmail.com'],
        dueDate: 'Monday',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
      {
        id: '2',
        name: 'Task 2',
        assignee: ['ducccdh.21it@gmail.com'],
        dueDate: '',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
    ],
  },
  {
    title: 'Doing',
    tasks: [
      {
        id: '3',
        name: 'Task 3',
        assignee: ['ducccdh.21it@gmail.com'],
        dueDate: '',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
    ],
  },
  {
    title: 'Done',
    tasks: [
      {
        id: '4',
        name: 'Schedule kickoff meeting',
        assignee: ['ducccdh.21it@gmail.com'],
        dueDate: 'Today - 28 Jul',
        priority: 'Medium',
        status: TaskStatus.TO_DO,
      },
      {
        id: '5',
        name: 'Draft project brief',
        assignee: ['ducccdh.21it@gmail.com', 'ducdsdaf.21it@gmail.com'],
        dueDate: '23 - 25 Jul',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
      {
        id: '6',
        name: 'Task 4',
        assignee: ['ducccdh.21it@gmail.com', 'ducsdfdh.21it@gmail.com', 'ducdh.21it@gmail.com'],
        dueDate: '12/08/2025',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
      {
        id: '7',
        name: 'Task 5',
        assignee: ['ducccdh.21it@gmail.com'],
        dueDate: '12/08/2025',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
      {
        id: '8',
        name: 'Task 6',
        assignee: [],
        dueDate: '12/08/2025',
        priority: 'Low',
        status: TaskStatus.TO_DO,
      },
    ],
  },
]

export default function App() {
  return <TaskBoard sections={sampleData} assignees={assignees} />
}
