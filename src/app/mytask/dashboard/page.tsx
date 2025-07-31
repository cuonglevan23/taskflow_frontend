"use client"
import React from "react"
import { Plus, Filter, Expand, Edit, MoreHorizontal } from "lucide-react"
import RadialChart from "./components/radial_chart";
import BarChart from "./components/BarChart";

export default function TaskDashboard() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your task progress and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Add widget
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-800 underline">Send feedback</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Completed Tasks</h3>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">1</div>
            <div className="flex items-center gap-1 mt-3">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Incomplete Tasks</h3>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">11</div>
            <div className="flex items-center gap-1 mt-3">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Overdue Tasks</h3>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="flex items-center gap-1 mt-3">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">1 Filter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">12</div>
            <div className="flex items-center gap-1 mt-3">
              <Filter className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">No Filters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Task Distribution</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
                         <div className="h-80 w-full">
               <BarChart />
             </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Completion Status</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="h-80 flex justify-center items-center">
              <RadialChart />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
