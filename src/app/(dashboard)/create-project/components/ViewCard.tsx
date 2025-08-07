"use client";

import { CheckCircle, Circle } from "lucide-react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const fakeTasks = [
  { id: 1, done: true },
  { id: 2, done: true },
  { id: 3, done: false },
  {},
  { id: 4, done: true },
  {},
  { id: 5, done: true },
  { id: 6, done: true },
  { id: 7, done: true },
];

interface ViewCardProps {
  projectName?: string;
}

export default function ViewCard({ projectName }: ViewCardProps) {
  return (
    <div className="bg-white rounded-xl shadow  p-4 w-full overflow-hidden mt-8">
      <div className="text-xl font-semibold mb-4">
        {" "}
        <div className="text-xl font-semibold mb-4">
          {projectName || "No Project"}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 text-sm font-medium border-b mb-3">
        {["List", "Board", "Dashboard", "Calendar", "Files"].map(
          (tab, index) => (
            <div
              key={tab}
              className={cn(
                "pb-2",
                index === 0
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              )}
            >
              {tab}
            </div>
          )
        )}
      </div>

      {/* Tasks Table */}
      <div className="space-y-2 divide-y divide-gray-100">
        {fakeTasks.map((task, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[40px_1fr_40px_80px_80px_80px] items-center gap-4 py-2"
          >
            {/* Checkbox */}
            <div>
              {task?.done !== undefined ? (
                task.done ? (
                  <CheckCircle className="text-green-500 w-4 h-4" />
                ) : (
                  <Circle className="text-gray-400 w-4 h-4" />
                )
              ) : null}
            </div>

            {/* Task Title (mocked as gray bar) */}
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>

            {/* Assignee */}
            <div>
              {/* <Avatar className="w-6 h-6">
                <AvatarFallback>A</AvatarFallback>
              </Avatar> */}
            </div>

            {/* Due Date */}
            <div className="flex items-center text-gray-500 space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">--</span>
            </div>

            {/* Priority */}
            <div className="w-12 h-4 rounded bg-red-400"></div>

            {/* Tag/Status */}
            <div className="flex space-x-1">
              <div className="w-12 h-4 bg-purple-400 rounded"></div>
              {idx % 3 === 0 && (
                <div className="w-12 h-4 bg-yellow-400 rounded"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
