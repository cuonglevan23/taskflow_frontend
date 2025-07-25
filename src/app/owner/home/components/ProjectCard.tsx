import React from "react";
import { Calendar, Users } from "lucide-react";

type Project = {
  name: string;
  status: string;
  priority: string;
  description: string;
  startDate: string;
  endDate: string;
  team: string;
  pm: string;
  tasks: string;
  progress: number;
  budget: number;
  spent: number;
  statusNote: string;
  budgetStatus: string;
};

type ProjectCardProps = {
  project: Project;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-purple-100 text-purple-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'On Track':
      return 'bg-blue-100 text-blue-800';
    case 'Off Track':
      return 'bg-red-100 text-red-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:bg-indigo-50 hover:shadow-md transition p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900">
          {project.name}
          <span
            className={`ml-2 text-xs px-2 py-1 rounded ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
          <span
            className={`ml-2 text-xs px-2 py-1 rounded ${getPriorityColor(
              project.priority
            )}`}
          >
            {project.priority}
          </span>
        </div>

        <div className="flex gap-2">
          <button className="text-sm px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md">
            View
          </button>
          <button className="text-sm px-3 py-1 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 rounded-md">
            Edit
          </button>
          <button className="text-sm px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md">
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm">{project.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="flex gap-2 items-center">
          <Calendar size={16} className="text-gray-400" />
          {project.startDate} - {project.endDate}
        </div>
        <div className="flex gap-2 items-center">
          <Users size={16} className="text-gray-400" />
          {project.team}
        </div>
        <div className="flex gap-2 items-center">👤 PM: {project.pm}</div>
        <div className="flex gap-2 items-center">📋 Tasks: {project.tasks}</div>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-1">Project Progress</p>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="text-xs text-blue-500 mt-1">⚡ {project.statusNote}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-1">Budget</p>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: `${(project.spent / project.budget) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span className="text-green-600">{project.budgetStatus}</span>
          <span className="text-green-600">
            ${project.spent.toLocaleString()} / $
            {project.budget.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
