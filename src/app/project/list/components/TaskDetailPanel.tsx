"use client";

import { Check, ChevronDown, CircleCheck, X } from "lucide-react";
import { useState } from "react";
import { Task } from "@/types/task";
import DetailPanel from "@/components/ui/DetailPanel/DetailPanel";
import DueDatePicker from "./DueDatePicker";

interface Props {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const filters = ["Recently assigned", "Do today", "Do next week", "Do later"];

export default function TaskDetailPanel({ task, isOpen, onClose }: Props) {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <DetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={task.name}
      width="max-w-[600px]"
    >
      <div className="flex flex-col h-full">
        {/* Scroll contents */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Assignee Filter */}
          <div className="flex items-end gap-2">
            <div className="text-sm font-medium text-gray-700 mb-1">
              My tasks
            </div>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-md px-3 py-1 flex items-center w-full sm:w-60 text-sm text-gray-700"
              >
                {selectedFilter}
                <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-1 left-0 z-10 bg-white rounded-md shadow w-48">
                  <div className="text-xs px-3 py-1 text-gray-700">
                    My tasks
                  </div>
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setSelectedFilter(filter);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center px-3 py-1.5 text-sm w-full text-left hover:bg-gray-100 ${
                        selectedFilter === filter
                          ? "font-medium text-blue-600"
                          : ""
                      }`}
                    >
                      <span className="inline-block w-4 mr-2">
                        {selectedFilter === filter && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </span>
                      <span>{filter}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Due date */}
          <DueDatePicker
            initialDate={task.dueDate}
            onChange={(newDate) => {
              console.log("New due date:", newDate);
            }}
          />

          {/* Project info */}
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700 w-[100px]">
                Projects
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded shadow-sm">
                <span className="w-2.5 h-2.5 bg-teal-300 rounded-full" />
                <span className="text-sm text-gray-700">
                  Cross-functional project plan
                </span>
                <span className="text-xs text-gray-500">To do</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-x-6 mt-4">
              <div className="text-sm font-medium text-gray-700">
                Dependencies
              </div>
              <div className="text-blue-500 text-sm cursor-pointer hover:underline">
                Add dependencies
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="flex items-start gap-x-6 mt-4">
            <div className="text-sm font-medium text-gray-700 min-w-[70px] pt-2">
              Fields
            </div>
            <div className="rounded-md overflow-hidden border border-gray-300 w-full max-w-md">
              <table className="w-full table-auto">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <CircleCheck className="w-4 h-4 text-gray-400" />
                        Priority
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-teal-200 text-teal-800 text-sm px-2 py-0.5 rounded">
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <CircleCheck className="w-4 h-4 text-gray-400" />
                        Status
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-sky-300 text-sky-900 text-sm px-2 py-0.5 rounded">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-center gap-x-6 pb-8">
            <div className="text-sm font-medium text-gray-700">Description</div>
            <p className="text-gray-700 text-sm mt-1">
              What is this task about?
            </p>
          </div>
        </div>

        <div className="border-t px-4 py-6 bg-white">
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-semibold">
              {task.assignee[0][0]}
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Add a comment"
                className="w-full h-18 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-400">
                  0 people will be notified
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailPanel>
  );
}
