"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus, Calendar, Filter, Settings, Search } from "lucide-react"

interface Task {
  id: number
  text: string
  color: string
  startDate: number
  endDate: number
  month: number
  year: number
  row?: number
}

export default function CalendarPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 6, 20)) // July 20, 2025 (Sunday)

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // Calculate current week dates
  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentWeekStart])

  // Extended tasks with more entries to demonstrate scrolling
  const allTasks: Task[] = [
    // July 2025 tasks
    { id: 1, text: "Project Planning", color: "bg-blue-200", startDate: 21, endDate: 23, month: 6, year: 2025, row: 0 },
    { id: 2, text: "Team Meeting", color: "bg-green-200", startDate: 22, endDate: 22, month: 6, year: 2025, row: 1 },
    { id: 3, text: "Code Review", color: "bg-yellow-200", startDate: 22, endDate: 22, month: 6, year: 2025, row: 2 },
    { id: 4, text: "qyedddqqdy", color: "bg-teal-200", startDate: 25, endDate: 26, month: 6, year: 2025, row: 0 },
    { id: 5, text: "Client Call", color: "bg-purple-200", startDate: 25, endDate: 25, month: 6, year: 2025, row: 1 },
    { id: 6, text: "Documentation", color: "bg-orange-200", startDate: 24, endDate: 26, month: 6, year: 2025, row: 2 },

    // More tasks for demonstration
    { id: 7, text: "Daily Standup", color: "bg-indigo-200", startDate: 21, endDate: 21, month: 6, year: 2025, row: 3 },
    { id: 8, text: "Design Review", color: "bg-pink-200", startDate: 21, endDate: 21, month: 6, year: 2025, row: 4 },
    { id: 9, text: "Sprint Planning", color: "bg-red-200", startDate: 22, endDate: 22, month: 6, year: 2025, row: 5 },
    { id: 10, text: "Bug Fixes", color: "bg-gray-200", startDate: 23, endDate: 23, month: 6, year: 2025, row: 3 },
    { id: 11, text: "Testing", color: "bg-cyan-200", startDate: 23, endDate: 23, month: 6, year: 2025, row: 4 },
    { id: 12, text: "Deployment", color: "bg-lime-200", startDate: 24, endDate: 24, month: 6, year: 2025, row: 5 },
    {
      id: 13,
      text: "Performance Review",
      color: "bg-amber-200",
      startDate: 25,
      endDate: 25,
      month: 6,
      year: 2025,
      row: 6,
    },
    {
      id: 14,
      text: "Training Session",
      color: "bg-emerald-200",
      startDate: 26,
      endDate: 26,
      month: 6,
      year: 2025,
      row: 3,
    },
    { id: 15, text: "Retrospective", color: "bg-violet-200", startDate: 26, endDate: 26, month: 6, year: 2025, row: 4 },
    { id: 16, text: "1:1 Meeting", color: "bg-rose-200", startDate: 20, endDate: 20, month: 6, year: 2025, row: 0 },
    {
      id: 17,
      text: "Architecture Review",
      color: "bg-sky-200",
      startDate: 20,
      endDate: 20,
      month: 6,
      year: 2025,
      row: 1,
    },
    { id: 18, text: "Security Audit", color: "bg-stone-200", startDate: 21, endDate: 21, month: 6, year: 2025, row: 5 },
    {
      id: 19,
      text: "Database Migration",
      color: "bg-neutral-200",
      startDate: 23,
      endDate: 24,
      month: 6,
      year: 2025,
      row: 6,
    },
    { id: 20, text: "User Research", color: "bg-zinc-200", startDate: 25, endDate: 25, month: 6, year: 2025, row: 7 },

    // August 2025 tasks
    { id: 21, text: "Sprint Planning", color: "bg-indigo-200", startDate: 1, endDate: 2, month: 7, year: 2025, row: 0 },
    { id: 22, text: "Design Review", color: "bg-pink-200", startDate: 1, endDate: 1, month: 7, year: 2025, row: 1 },

    // June 2025 tasks
    { id: 23, text: "Q2 Review", color: "bg-red-200", startDate: 29, endDate: 30, month: 5, year: 2025, row: 0 },
  ]

  // Filter tasks for current week
  const currentWeekTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const taskStart = new Date(task.year, task.month, task.startDate)
      const taskEnd = new Date(task.year, task.month, task.endDate)
      const weekStart = weekDates[0]
      const weekEnd = weekDates[6]

      // Check if task overlaps with current week
      return taskStart <= weekEnd && taskEnd >= weekStart
    })
  }, [weekDates, allTasks])

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - today.getDay()) // Get Sunday of current week
    setCurrentWeekStart(sunday)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get current month and year for display
  const displayMonthYear = useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // If week spans multiple months, show both
    const startMonth = weekDates[0].getMonth()
    const endMonth = weekDates[6].getMonth()
    const startYear = weekDates[0].getFullYear()
    const endYear = weekDates[6].getFullYear()

    if (startMonth !== endMonth || startYear !== endYear) {
      return `${months[startMonth]} ${startYear} - ${months[endMonth]} ${endYear}`
    }

    return `${months[startMonth]} ${startYear}`
  }, [weekDates])

  // Get single-day tasks for a specific date
  const getSingleDayTasksForDate = (date: Date) => {
    return currentWeekTasks.filter((task) => {
      const taskStart = new Date(task.year, task.month, task.startDate)
      const taskEnd = new Date(task.year, task.month, task.endDate)
      return taskStart.toDateString() === date.toDateString() && taskEnd.toDateString() === date.toDateString()
    })
  }

  // Calculate position and width for multi-day tasks
  const getMultiDayTaskStyle = (task: Task) => {
    const taskStart = new Date(task.year, task.month, task.startDate)
    const taskEnd = new Date(task.year, task.month, task.endDate)

    // Find which days of the current week this task spans
    let startIndex = -1
    let endIndex = -1

    weekDates.forEach((date, index) => {
      if (date >= taskStart && startIndex === -1) startIndex = index
      if (date <= taskEnd) endIndex = index
    })

    if (startIndex === -1 || endIndex === -1) return { display: "none" }

    const columnWidth = 100 / 7
    const left = startIndex * columnWidth
    const width = (endIndex - startIndex + 1) * columnWidth

    return {
      position: "absolute" as const,
      left: `${left}%`,
      width: `${width}%`,
      top: `${(task.row || 0) * 48 + 8}px`,
      height: "36px",
      zIndex: 10,
      paddingLeft: "16px",
      paddingRight: "16px",
    }
  }

  // Get maximum number of task rows needed
  const maxRows = Math.max(...currentWeekTasks.map((t) => (t.row || 0) + 1), 8)

  // Separate single-day and multi-day tasks
  const multiDayTasks = currentWeekTasks.filter((task) => {
    const taskStart = new Date(task.year, task.month, task.startDate)
    const taskEnd = new Date(task.year, task.month, task.endDate)
    return taskStart.toDateString() !== taskEnd.toDateString()
  })

  return (
    <div className="w-full h-[calc(100vh-160px)] bg-white flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-20 relative">
        <div className="flex items-center gap-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add task
          </button>

          <div className="flex items-center gap-3">
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => navigateWeek("prev")}
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="px-4 py-2 hover:bg-gray-100 rounded-md font-medium text-gray-700 transition-colors"
              onClick={goToToday}
            >
              Today
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => navigateWeek("next")}
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-lg font-semibold text-gray-700">{displayMonthYear}</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center gap-2 transition-colors">
            <Calendar className="w-4 h-4" />
            Weeks
          </button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" />
            Options
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Headers - Fixed */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white z-10 relative">
        {weekDays.map((day, index) => (
          <div key={day} className="px-4 py-6 text-center border-r border-gray-200 last:border-r-0">
            <div className="text-sm font-semibold text-gray-600 mb-3">{day}</div>
            <div
              className={`text-2xl font-semibold ${
                isToday(weekDates[index])
                  ? "bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto"
                  : "text-gray-900"
              }`}
            >
              {weekDates[index].getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable Task Area */}
      <div className="flex-1 relative overflow-hidden scrollbar-hide">
        <div className="h-full overflow-y-auto">
          <div className="relative" style={{ minHeight: `${maxRows * 48 + 100}px` }}>
            {/* Multi-day tasks - rendered as continuous bars */}
            {multiDayTasks.map((task) => (
              <div
                key={task.id}
                className={`${task.color} rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center shadow-sm border border-white/50`}
                style={getMultiDayTaskStyle(task)}
                title={task.text}
              >
                <span className="truncate">{task.text}</span>
              </div>
            ))}

            {/* Day columns with single-day tasks */}
            <div className="grid grid-cols-7 h-full">
              {weekDates.map((date, index) => (
                <div key={date.toISOString()} className="border-r border-gray-200 last:border-r-0 px-4 py-2 relative">
                  {/* Single-day tasks for this day */}
                  <div className="relative" style={{ minHeight: `${maxRows * 48}px` }}>
                    {getSingleDayTasksForDate(date).map((task) => (
                      <div
                        key={task.id}
                        className={`${task.color} rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center shadow-sm border border-white/50`}
                        style={{
                          position: "absolute",
                          top: `${(task.row || 0) * 48 + 8}px`,
                          left: "0",
                          right: "0",
                          height: "36px",
                        }}
                        title={task.text}
                      >
                        <span className="truncate">{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add task buttons - Fixed at bottom */}
            <div className="grid grid-cols-7 mt-4 sticky bottom-0 bg-white border-t border-gray-200 z-10">
              {weekDates.map((date) => (
                <div key={date.toISOString()} className="border-r border-gray-200 last:border-r-0 px-4 py-4">
                  <button className="w-full text-left px-3 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors border border-dashed border-gray-300 hover:border-gray-400">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add task</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
