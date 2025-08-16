"use client";

import React from "react";
import { Task } from "@/types/task";
import { Plus } from "lucide-react";
import { Avatar } from 'antd';

type TaskSection = {
  title: string;
  tasks: Task[];
};

const statusColor = {
  LOW: "bg-teal-200 text-teal-800",
  MEDIUM: "bg-yellow-200 text-yellow-800",
  HIGH: "bg-red-200 text-red-800",
};

const progressColor = {
  "ON_TRACK": "bg-cyan-200 text-cyan-800",
  "OFF_TRACK": "bg-red-100 text-red-700",
  "IN_PROGRESS": "bg-purple-200 text-purple-800",
};
const bgColors = [
  "bg-red-200 text-red-800",
  "bg-green-200 text-green-800",
  "bg-yellow-200 text-yellow-800",
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-pink-200 text-pink-800",
  "bg-teal-200 text-teal-800",
];


const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 space-y-2 cursor-pointer">
    <div className="font-medium">{task.name}</div>
    
    <div className="flex flex-wrap gap-2 text-sm mt-4">
      <span className={`px-2 py-1 rounded-md ${statusColor[task.priority]}`}>
        {task.priority}
      </span>
      <span className={`px-2 py-1 rounded-md ${progressColor[task.status]}`}>
        {task.status}
      </span>
    </div>
    
    <div className="text-sm text-gray-600 flex items-center gap-2 mt-4">
      {task.assignee.map((assignee) => (
        <Avatar key={assignee} src={assignee} />
      ))}
      {task.dueDate}
    </div>
  </div>
);
const TaskBoard = ({ sections }: { sections: TaskSection[] }) => {
  return (
    <div className="flex gap-6 overflow-x-auto px-4 py-6">
      {sections?.map((section) => (
        <div key={section.title} className="w-72 flex-shrink-0 ">
          <div className="flex items-center gap-2 bg-zinc-100 rounded-xl p-2">
            <h2 className="text-lg font-semibold text-gray-600">
              {section.title}{" "}
            </h2>
            <h2 className="text-sm text-gray-500 my-1">0</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] bg-zinc-100 rounded-xl p-2 mt-2">
            {section.tasks.map((task) => (
              <TaskCard key={task.name} task={task} />
            ))}
          </div>
        </div>
      ))}
      <div className="w-72 flex-shrink-0 ">
        <div className="flex items-center gap-2 bg-zinc-100 rounded-xl p-2">
          <h2 className="text-lg font-semibold  flex items-center gap-2 text-gray-600">
            <Plus /> Section
          </h2>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] mt-2">
          <input
            type="text"
            placeholder="Add new section"
            className="bg-white w-full rounded-xl shadow-sm border border-gray-200 px-4 py-3 space-y-2"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
