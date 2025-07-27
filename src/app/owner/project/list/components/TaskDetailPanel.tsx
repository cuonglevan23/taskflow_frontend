"use client";

import { Check, ChevronDown, CircleCheck, X } from "lucide-react";
import { Task } from "@/types/task";
import { useState } from "react";
import DueDatePicker from "./DueDatePicker";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  task: Task;
  onClose: () => void;
  isOpen: boolean;
}

const filters = ["Recently assigned", "Do today", "Do next week", "Do later"];

export default function TaskDetailPanel({ task, onClose, isOpen }: Props) {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-white shadow-lg z-50 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{task.name}</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Assignee */}
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

            <div>
              {/* Project */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-700 w-[100px]">
                    Projects
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded shadow-sm ">
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
              </div>

              {/* Dependencies */}
              <div className="flex items-center gap-x-6 gap-y-4 mt-4">
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
                        <div className="flex items-center gap-1 ">
                          <CircleCheck className="w-4 h-4 text-gray-400" />
                          Priority
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-teal-200 text-teal-800 text-sm px-2 py-0.5 rounded">
                          Low
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
                          On track
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-center gap-x-6 pb-8 ">
              <div className="text-sm font-medium text-gray-700">
                Description
              </div>
              <p className="text-gray-700 text-sm mt-1">
                What is this task about?
              </p>
            </div>

            {/* Comments */}
            <div className="border-t pt-10 text-gray-300 gap-y-16 ">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
