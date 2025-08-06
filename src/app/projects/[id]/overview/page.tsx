"use client";

import { Avatar } from "antd";
import { Plus, Goal, FolderKanban, Info, FileText, Landmark, Paperclip } from "lucide-react";
import { useProject } from '../components/DynamicProjectProvider';

interface OverviewProps {
  projectId: string;
}

export default function Overview({ projectId }: OverviewProps) {
  const { project, loading, error } = useProject();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-500">{error || 'Project not found'}</div>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 ">
      {/* Left Panel */}
      <div className="lg:col-span-3 space-y-6 px-30 max-h-[80vh] overflow-y-auto">
        {/* Project Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            <span className="text-sm text-gray-500">{project.status}</span>
          </div>
        </div>

        {/* Project Description */}
        <div>
          <div className="font-semibold text-sm text-neutral-500 mb-1">Project description</div>
          <textarea
            rows={4}
            className="w-full p-3 text-sm mt-4 resize-none border border-gray-200 rounded-md"
            defaultValue={project.description}
          />
        </div>

        {/* Project Roles */}
        <div className="mt-6">
          <div className="font-semibold text-sm text-neutral-500 mb-1">Project roles</div>
          <div className="flex items-center gap-10 mt-4">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                <Plus size={18} />
              </button>
              <div className="text-sm font-medium">Add Role</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar style={{ backgroundColor: project.color }}>PM</Avatar>
              <div>
                <div className="text-sm font-medium">Project Manager</div>
                <div className="text-xs text-gray-500">Project owner</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar style={{ backgroundColor: '#6ee7b7' }}>TM</Avatar>
              <div>
                <div className="text-sm font-medium">Team Member</div>
                <div className="text-xs text-gray-500">Developer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Goals */}
        <div className="mt-10">
          <div className="font-semibold text-sm text-neutral-500 mb-1">Connected goals</div>
          <div className="border min-h-[125px] border-dashed border-gray-300 p-6 rounded-lg text-center text-sm text-gray-500">
            <Goal className="mx-auto mb-2" size={20} />
            Connect or create a goal to link this project to a larger purpose.<br />
            <button className="mt-2 text-indigo-600 font-medium hover:underline">Add goal</button>
          </div>
        </div>

        {/* Key Resources */}
        <div className="mt-10">
          <div className="font-semibold text-sm text-neutral-500 mb-1">Key resources</div>
          <div className="border min-h-[125px] border-dashed border-gray-300 p-6 rounded-lg text-center text-sm text-gray-500">
            Align your team around a shared vision with a project brief and supporting resources.
            <div className="flex justify-center gap-4 mt-3">
              <button className="flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                <FileText size={16} /> Create project brief
              </button>
              <button className="flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                <Paperclip size={16} /> Add links & files
              </button>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-500 mb-1">
            Milestones <Plus size={14} />
          </div>
          <div className="border-t border-gray-200 pt-2 text-sm text-gray-500">
            <button className="flex items-center gap-2 text-green-600">
              <Landmark size={16} /> Add milestone...
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="space-y-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="font-bold text-yellow-800 mb-1">
            {project.status === 'active' ? 'On track' : 'At risk'}
          </div>
          <div className="text-sm font-medium">{project.name} Status</div>
          <div className="text-xs text-gray-600 mt-1">Updated · Just now</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-sm text-neutral-700">Project summary</div>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Use artificial intelligence to catch up on what's happened in this project recently.
          </p>
          <button className="text-sm text-indigo-600 hover:underline">View summary</button>
        </div>

        <div className="border-l border-gray-300 pl-4">
          <div className="text-xs text-gray-400 mb-2">
            {project.endDate ? `Due: ${new Date(project.endDate).toLocaleDateString()}` : 'No due date'}
          </div>
          <button className="text-sm text-indigo-600 mb-2">Send message to members</button>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>🟢 {project.name} - Created · 2 minutes ago</li>
            <li>📝 Project setup completed · 5 minutes ago</li>
            <li>👥 Team members added · 10 minutes ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}