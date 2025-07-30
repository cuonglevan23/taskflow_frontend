import React from 'react'
import { Plus, Search, ListFilter, ArrowUpDown } from 'lucide-react'

interface TaskHeaderProps {
  onAddTask: () => void
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onAddTask }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mx-0 sm:mx-4 gap-2 sm:gap-0">
      <button 
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1 rounded-md w-full sm:w-auto justify-center"
        onClick={onAddTask}
      >
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
  )
}

export default TaskHeader 