import React from 'react'
import TaskBoard from './TaskBoard'
import { Task } from '../../../../types/task'

const sampleData: { title: string; tasks: Task[] }[] = [
  {
    title: 'To do',
    tasks: [
      {
        name: 'Task 1',
        assignee: ['d2'],
        dueDate: 'Monday',
        priority: 'Low',
        status: 'On track',
      },
      {
        name: 'Task 2',
        assignee: ['sd'],
        dueDate: '',
        priority: 'Low',
        status: 'On track',
      },
    ],
  },
  {
    title: 'Doing',
    tasks: [
      {
        name: 'Task 3',
        assignee: ['sd'],
        dueDate: '',
        priority: 'Low',
        status: 'On track',
      },
    ],
  },
  {
    title: 'Done',
    tasks: [
      {
        name: 'Schedule kickoff meeting',
        assignee: ['kh'],
        dueDate: 'Today - 28 Jul',
        priority: 'Medium',
        status: 'Off track',
      },
      {
        name: 'Draft project brief',
        assignee: ['OH', 'd2'],
        dueDate: '23 - 25 Jul',
        priority: 'Low',
        status: 'On track',
      },
      {
        name: 'Task 4',
        assignee: ['OH', 'd2'],
        dueDate: '',
        priority: 'Low',
        status: 'On track',
      },
      {
        name: 'Task 5',
        assignee: ['OH', 'hj'],
        dueDate: '',
        priority: 'Low',
        status: 'On track',
      },
      {
        name: 'Task 6',
        assignee: [],
        dueDate: '',
        priority: 'Low',
        status: 'On track',
      },
    ],
  },
]

export default function App() {
  return <TaskBoard sections={sampleData} />
}
