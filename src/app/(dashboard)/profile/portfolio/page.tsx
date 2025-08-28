"use client";

import React from "react";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { 
  Briefcase,
  Plus,
  Award,
  Star,
  FolderOpen,
  CheckCircle,
  Clock
} from "lucide-react";

// Mock portfolio data
const mockProjects = [
  {
    id: 1,
    title: "Task Management System",
    description: "A comprehensive task management platform built with React and Node.js",
    technologies: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    status: "Completed",
    startDate: "Jan 2024",
    endDate: "Jun 2024",
    role: "Full Stack Developer",
    teamSize: 4,
    image: null,
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example"
  },
  {
    id: 2,
    title: "E-commerce Dashboard",
    description: "Analytics dashboard for e-commerce businesses with real-time data visualization",
    technologies: ["Vue.js", "Python", "Django", "Chart.js"],
    status: "In Progress",
    startDate: "Aug 2024",
    endDate: "Dec 2024",
    role: "Frontend Lead",
    teamSize: 6,
    image: null,
    liveUrl: null,
    githubUrl: "https://github.com/example2"
  }
];

const mockSkills = [
  { name: "React", level: 90, category: "Frontend" },
  { name: "TypeScript", level: 85, category: "Language" },
  { name: "Node.js", level: 80, category: "Backend" },
  { name: "PostgreSQL", level: 75, category: "Database" },
  { name: "Docker", level: 70, category: "DevOps" },
  { name: "AWS", level: 65, category: "Cloud" }
];

const mockExperience = [
  {
    id: 1,
    company: "Tech Corp",
    position: "Senior Full Stack Developer",
    startDate: "Jan 2023",
    endDate: "Present",
    description: "Leading development of web applications and mentoring junior developers"
  },
  {
    id: 2,
    company: "StartupXYZ",
    position: "Frontend Developer",
    startDate: "Jun 2021",
    endDate: "Dec 2022",
    description: "Built responsive web applications using React and collaborated with design team"
  }
];

export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* My Projects Card - Left Column */}
        <div className="lg:col-span-2">
          <BaseCard
            title="My recent projects"
            icon={<FolderOpen className="w-5 h-5 text-gray-400" />}
            showMoreButton={{
              show: true,
              onClick: () => console.log("Show more projects")
            }}
            onMenuClick={() => console.log("Projects menu")}
          >
            <div className="space-y-3">
              {mockProjects.map((project) => (
                <div key={project.id} className="group">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">
                          {project.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          {project.status === "Completed" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <UserAvatar 
                            name={project.role} 
                            size="xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{project.role}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{project.startDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Card */}
          <BaseCard
            title="Frequent skills"
            icon={<Star className="w-5 h-5 text-gray-400" />}
            createAction={{
              icon: Plus,
              label: "Add skill",
              onClick: () => console.log("Add skill")
            }}
            showMoreButton={{
              show: true,
              onClick: () => console.log("Show more skills")
            }}
          >
            <div className="space-y-3">
              {mockSkills.slice(0, 6).map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <UserAvatar 
                    name={skill.name.substring(0, 2)} 
                    size="sm"
                    fallbackColor={`bg-${skill.category === 'Frontend' ? 'blue' : skill.category === 'Backend' ? 'green' : 'purple'}-500`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{skill.name}</span>
                      <span className="text-xs text-gray-400">{skill.level}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>

          {/* Experience Card */}
          <BaseCard
            title="My experience"
            icon={<Award className="w-5 h-5 text-gray-400" />}
            showMoreButton={{
              show: true,
              onClick: () => console.log("Show more experience")
            }}
          >
            <div className="space-y-3">
              {mockExperience.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mt-1">
                      <span className="text-xs font-medium text-white">
                        {exp.company.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{exp.position}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-400">{exp.company}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
