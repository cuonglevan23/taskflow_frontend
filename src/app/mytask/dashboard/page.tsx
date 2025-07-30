"use client"
import React from "react"
import { Plus, Filter, Expand, Edit, MoreHorizontal } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const tasksBySection = [
  { name: "To do", tasks: 9 },
  { name: "Doing", tasks: 0 },
  { name: "Done", tasks: 2 },
]

const completionData = [
  { name: "Completed", value: 1, color: "#8b5cf6" },
  { name: "Incomplete", value: 11, color: "#c4b5fd" },
]

const tasksByProject = [{ name: "Project A", tasks: 2 }]

const taskCompletionOverTime = [
  { date: "01/19", completed: 0, incomplete: 3 },
  { date: "01/20", completed: 0, incomplete: 3 },
  { date: "01/21", completed: 0, incomplete: 3 },
  { date: "01/22", completed: 0, incomplete: 3 },
  { date: "01/23", completed: 2, incomplete: 3 },
  { date: "01/24", completed: 3, incomplete: 3 },
  { date: "01/25", completed: 3, incomplete: 3 },
  { date: "01/26", completed: 3, incomplete: 3 },
  { date: "01/27", completed: 3, incomplete: 3 },
  { date: "01/28", completed: 3, incomplete: 3 },
  { date: "01/29", completed: 3, incomplete: 3 },
]

export default function TaskDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
          <Plus className="h-4 w-4" />
          Add widget
        </button>
        <button className="text-sm text-blue-600 hover:text-blue-800 underline">Send feedback</button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total completed tasks</h3>
          </div>
          <div className="px-4 pb-4">
            <div className="text-3xl font-bold">1</div>
            <div className="flex items-center gap-1 mt-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total incomplete tasks</h3>
          </div>
          <div className="px-4 pb-4">
            <div className="text-3xl font-bold">11</div>
            <div className="flex items-center gap-1 mt-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total overdue tasks</h3>
          </div>
          <div className="px-4 pb-4">
            <div className="text-3xl font-bold">3</div>
            <div className="flex items-center gap-1 mt-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total tasks</h3>
          </div>
          <div className="px-4 pb-4">
            <div className="text-3xl font-bold">12</div>
            <div className="flex items-center gap-1 mt-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">No Filters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-4 flex justify-between items-center">
            <h3 className="text-base font-medium">Total incomplete tasks by section</h3>
            <div className="flex gap-2">
              <button>
                <Expand className="h-4 w-4" />
              </button>
              <button>
                <Edit className="h-4 w-4" />
              </button>
              <button>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksBySection} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    label={{ value: "Task count (in numbers)", angle: -90, position: "insideLeft" }}
                  />
                  <Bar dataKey="tasks" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pb-4">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">1 Filter</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 underline">See all</button>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-4">
            <h3 className="text-base font-medium">Total tasks by completion status</h3>
          </div>
          <div className="px-4">
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">12</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#c4b5fd" }}></div>
                <span className="text-sm text-gray-600">Incomplete</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pb-4">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">2 Filters</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 underline">See all</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total tasks by project */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-4">
            <h3 className="text-base font-medium">Total upcoming tasks by assignee</h3>
          </div>
          <div className="px-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByProject} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    label={{ value: "Task count (in numbers)", angle: -90, position: "insideLeft" }}
                  />
                  <Bar dataKey="tasks" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pb-4">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">1 Filter</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 underline">See all</button>
            </div>
          </div>
        </div>

        {/* Task completion over time */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 pb-4">
            <h3 className="text-base font-medium">Task completion over time</h3>
          </div>
          <div className="px-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    label={{ value: "Task count (in numbers)", angle: -90, position: "insideLeft" }}
                  />
                  <Bar dataKey="incomplete" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pb-4">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">2 Filters</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 underline">+ more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
