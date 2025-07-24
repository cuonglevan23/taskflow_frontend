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
    <div className="pt-4 w-full px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mx-0 sm:mx-4 gap-2 sm:gap-0">
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1 rounded-md w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
        <div className="relative flex-grow max-w-full sm:max-w-sm mx-0 sm:mx-4 w-full">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-10 pr-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4" />
            <span className="hidden xs:inline">Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden xs:inline">Sort</span>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide max-h-[530px] mt-2">
        {/* Table header: hidden on mobile */}
        <table className="min-w-[700px] md:min-w-[1270px] border-separate border-spacing-y-2 mt-4 hidden md:table">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-t border-gray-20">
              <th className='min-w-[200px] border-r border-b border-t border-gray-300 px-2 py-2'>Name</th>
              <th className='min-w-[130px] border-r border-b border-t border-gray-300 px-2 py-2'>Assignee</th>
              <th className='min-w-[100px] border-r border-b border-t border-gray-300 px-2 py-2'>Due Date</th>
              <th className='min-w-[100px] border-r border-b border-t border-gray-300 px-2 py-2'>Priority</th>
              <th className='min-w-[100px] border-r border-b border-t border-gray-300 px-2 py-2'>Status</th>
              <th className='min-w-[70px] border-b border-t border-gray-300 px-2 py-2'><Plus /></th>
            </tr>
          </thead>
        </table>

        {/* Table body: card view on mobile, table on desktop */}
        <div className="max-h-[700px] min-w-[700px] md:min-w-[1270px] overflow-y-auto scrollbar-hide">
          {/* Desktop table */}
          <table className="w-full border-separate border-spacing-y-2 mt-4 hidden md:table">
            <tbody>
              <tr className='rounded overflow-hidden border-b border-gray-300'>
                <td className='py-2 px-2 min-w-[200px] flex items-center gap-2 font-bold text-gray-500 hover:text-gray-700 cursor-pointer '>
                  <ChevronDown className="w-4 h-4" /> To Do
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="min-w-[200px] py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className='flex items-center gap-2'><CheckCircle className="w-5 h-5 text-gray-400" />
                      {task.name}</span>
                  </td>
                  <td className="min-w-[130px] py-2 px-2 gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className='flex items-center gap-2'><User className="w-5 h-5 text-gray-400" />
                      {task.assignee}</span>
                  </td>
                  <td className="min-w-[100px] py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="min-w-[70px] py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}
              <tr className=' rounded overflow-hidden border-b border-gray-300 mt-4'>
                <td className='py-2 px-2 flex items-center gap-2 mt-4 font-bold text-gray-500 hover:text-gray-700 cursor-pointer '>
                  <ChevronDown className="w-4 h-4" /> Doing
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="min-w-[200px] py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    {task.name}
                  </td>
                  <td className="min-w-[130px] py-2 px-2   border-r border-b border-t border-gray-300 px-2 py-2">
                    <User className="w-5 h-5 text-gray-400" />
                    {/* {task.assignee} */}
                  </td>
                  <td className="min-w-[100px] py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="min-w-[70px] py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}

              <tr className='rounded overflow-hidden border-b border-gray-300 '>
                <td className='py-2 px-2 flex items-center gap-2 mt-4 font-bold text-gray-500 hover:text-gray-700 cursor-pointer '>
                  <ChevronDown className="w-4 h-4" /> Done
                </td>
              </tr>
              {tasks.map((task, index) => (
                <tr key={index} className="bg-indigo-20 hover:bg-indigo-100 rounded overflow-hidden border-b border-gray-300">
                  <td className="min-w-[200px] py-2 px-2 flex items-center gap-2  border-r border-b border-t border-gray-300 px-2 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    {task.name}
                  </td>
                  <td className="min-w-[130px] py-2 px-2   border-r border-b border-t border-gray-300 px-2 py-2">
                    <User className="w-5 h-5 text-gray-400" />
                    {/* {task.assignee} */}
                  </td>
                  <td className="min-w-[100px] py-2 px-2 text-sm text-gray-700 border-r border-b border-t border-gray-300 px-2 py-2">{task.dueDate}</td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="min-w-[100px] py-2 px-2 border-r border-b border-t border-gray-300 px-2 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="min-w-[70px] py-2 px-2 border-b border-t border-gray-300 px-2 py-2">{/* thêm hành động nếu cần */}</td>
                </tr>
              ))}

            </tbody>
          </table>
          {/* Mobile card view */}
          <div className="flex flex-col gap-3 md:hidden mt-4">
            {/* To Do section */}
            <div className="font-bold text-gray-500 flex items-center gap-2 text-base mb-1"><ChevronDown className="w-4 h-4" /> To Do</div>
            {tasks.map((task, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow border border-gray-200 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><CheckCircle className="w-5 h-5 text-gray-400" /> {task.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><User className="w-4 h-4" /> {task.assignee}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Due: <span className="text-gray-700">{task.dueDate}</span></span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                </div>
              </div>
            ))}
            {/* Doing section */}
            <div className="font-bold text-gray-500 flex items-center gap-2 text-base mt-4 mb-1"><ChevronDown className="w-4 h-4" /> Doing</div>
            {tasks.map((task, idx) => (
              <div key={idx+100} className="bg-white rounded-lg shadow border border-gray-200 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><CheckCircle className="w-5 h-5 text-gray-400" /> {task.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><User className="w-4 h-4" /> {task.assignee}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Due: <span className="text-gray-700">{task.dueDate}</span></span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                </div>
              </div>
            ))}
            {/* Done section */}
            <div className="font-bold text-gray-500 flex items-center gap-2 text-base mt-4 mb-1"><ChevronDown className="w-4 h-4" /> Done</div>
            {tasks.map((task, idx) => (
              <div key={idx+200} className="bg-white rounded-lg shadow border border-gray-200 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-gray-700"><CheckCircle className="w-5 h-5 text-gray-400" /> {task.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><User className="w-4 h-4" /> {task.assignee}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Due: <span className="text-gray-700">{task.dueDate}</span></span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectListPage