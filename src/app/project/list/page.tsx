import React from 'react'
import { Task } from '@/types/task'
import { CheckCircle, Plus, User } from 'lucide-react'
import { ArrowUpDown, ListFilter, Search, ChevronDown } from 'lucide-react'
const tasks: Task[] = [
  {
    name: 'Task 1',
    assignee: 'John Doe',
    dueDate: '2025-01-01',
    priority: 'Low',
    status: 'On track'
  },
  {
    name: 'Task 2',
    assignee: 'Jane Doe',
    dueDate: '2025-01-02',
    priority: 'Medium',
    status: 'Off track'
  },
  {
    name: 'Task 3',
    assignee: 'John Doe',
    dueDate: '2025-01-03',
    priority: 'High',
    status: 'In progress'
  }
]
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-purple-300 text-purple-800'
    case 'Medium':
      return 'bg-yellow-300 text-yellow-800'
    default:
      return 'bg-green-300 text-green-800'
  }
}
const getStatusColor = (status: string) => {
  switch (status) {
    case 'On track':
      return 'bg-blue-300 text-green-800'
    case 'Off track':
      return 'bg-red-300 text-red-900'
    case 'In progress':
      return 'bg-yellow-300 text-yellow-800'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}
const ProjectListPage = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mx-4">
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1 rounded-md">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
        <div className="relative flex-grow max-w-sm mx-4 sm:block">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-10 pr-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4" />
            <span>Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort</span>
          </div>
        </div>
      </div>
      <div className="mx-4">
        <table className="w-full border-separate border-spacing-y-2 mt-4">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-t border-gray-20">
              <th className='border-r border-b border-t border-gray-300 px-2 py-2'>Name</th>
              <th className='border-r border-b border-t border-gray-300 px-2 py-2'>Assignee</th>
              <th className='border-r border-b border-t border-gray-300 px-2 py-2'>Due Date</th>
              <th className='border-r border-b border-t border-gray-300 px-2 py-2'>Priority</th>
              <th className='border-r border-b border-t border-gray-300 px-2 py-2'>Status</th>
              <th className=' border-b border-t border-gray-300 px-2 py-2'><Plus /></th>
            </tr>
          </thead>
        
            <tbody >
              <tr className='rounded overflow-hidden border-b border-gray-300'>
                <td className='py-2 px-2 flex items-center gap-2 '>
                  <div className="flex items-center gap-2"><ChevronDown className="w-4 h-4" /> To Do</div>
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    {task.name}
                  </td>
                  <td className="py-2 px-2   border-r border-b border-t border-gray-300 px-2 py-2">
                    <User className="w-5 h-5 text-gray-400" />
                    {/* {task.assignee} */}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}
              <tr className=' rounded overflow-hidden border-b border-gray-300 mt-4'>
                <td className='py-2 px-2 flex items-center gap-2 mt-4'>
                  <div className="flex items-center gap-2"><ChevronDown className="w-4 h-4" /> Doing</div>
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    {task.name}
                  </td>
                  <td className="py-2 px-2   border-r border-b border-t border-gray-300 px-2 py-2">
                    <User className="w-5 h-5 text-gray-400" />
                    {/* {task.assignee} */}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}

              <tr className='rounded overflow-hidden border-b border-gray-300 '>
                <td className='py-2 px-2 flex items-center gap-2 mt-4'>
                  <div className="flex items-center gap-2"><ChevronDown className="w-4 h-4" /> Done</div>
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    {task.name}
                  </td>
                  <td className="py-2 px-2   border-r border-b border-t border-gray-300 px-2 py-2">
                    <User className="w-5 h-5 text-gray-400" />
                    {/* {task.assignee} */}
                  </td>
                  <td className="py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}
            </tbody>
        
        </table>

      </div>

    </div>


  )
}

export default ProjectListPage