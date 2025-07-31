"use client"
import React from "react"
import { Plus, Filter, Expand, Edit, MoreHorizontal } from "lucide-react"
import RadialChart from "./components/radial_chart";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Total completed tasks</h3>
            <div className="w-full h-full flex justify-center items-center">
              <RadialChart />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Total completed tasks</h3>
            <div className="w-full h-full flex justify-center items-center">
              <RadialChart />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
