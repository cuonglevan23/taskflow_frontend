"use client";
import ProjectCard from "./components/ProjectCard";
import React, { useState } from "react";
import {
  Users,
  ListChecks,
  FolderKanban,
  CircleDollarSign,
  FolderCheck,
} from "lucide-react";
import StatCard from "./components/StatCard";
import ProjectFilters from "./components/ProjectFilters";

import { Project } from "./types/project.types";
import { projects } from "./data/projects";
import { PrivateLayout } from "@/layouts";

const HomePage = () => {
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [keyword, setKeyword] = useState("");

  const handleClearFilters = () => {
    setStatus("All");
    setPriority("All");
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = status === "All" || p.status === status;
    const matchesPriority = priority === "All" || p.priority === priority;
    const matchesKeyword =
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.pm.toLowerCase().includes(keyword.toLowerCase());
    return matchesStatus && matchesPriority && matchesKeyword;
  });

  return (
    <PrivateLayout>
      <div className="px-6 py-8 space-y-10 bg-gray-50 min-h-screen">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold text-gray-900">All Projects</h1>
          <p className="text-gray-500">
            Manage and track all company projects efficiently
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Projects"
            value="5"
            icon={<FolderKanban className="text-indigo-500" />}
          />
          <StatCard
            title="In Progress"
            value="2"
            icon={<ListChecks className="text-yellow-500" />}
          />
          <StatCard
            title="Completed"
            value="2"
            icon={<FolderCheck className="text-green-500" />}
          />
          <StatCard
            title="Total Budget"
            value="$2.0M"
            icon={<CircleDollarSign className="text-blue-500" />}
          />
          <StatCard
            title="Spent"
            value="$875K"
            icon={<CircleDollarSign className="text-red-400" />}
          />
          <StatCard
            title="Total Members"
            value="34"
            icon={<Users className="text-purple-500" />}
          />
        </div>

        {/* Filters */}
        <div className="mt-4">
          <ProjectFilters
            keyword={keyword}
            status={status}
            priority={priority}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onKeywordChange={setKeyword}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Project List */}
        <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default HomePage;