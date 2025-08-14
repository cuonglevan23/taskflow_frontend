"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GrProjects } from "react-icons/gr";
import { useProjects, type Project } from "@/hooks";

// Professional ProjectsCard using BaseCard & useProjects Hook - Senior Product Code
const ProjectsCard = () => {
  const { theme } = useTheme();

  // Use the custom hook for data management
  const {
    featuredProject,
    displayedProjects,
    showAllProjects,
    hasMoreProjects,
    isLoading,
    toggleShowAll,
    addProject,
    projectStats
  } = useProjects({
    initialLimit: 4,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  // Project Item Component - Professional Implementation
  const ProjectItem = ({ project }: { project: Project }) => {
    const IconComponent = project.icon || GrProjects;

    return (
      <div
        className="flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer group"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Project Icon with Professional Styling */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105"
          style={{ backgroundColor: project.color }}
        >
          <IconComponent
            className="w-4 h-4 text-white"
          />
        </div>

        {/* Project Name */}
        <span
          className="text-sm font-medium truncate"
          style={{ color: theme.text.primary }}
        >
          {project.name}
        </span>
      </div>
    );
  };

  // Featured Project Component - Professional Implementation
  const FeaturedProject = ({ project }: { project: Project }) => {
    const IconComponent = project.icon || GrProjects;

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: project.color + '20', // 20% opacity
          border: `1px solid ${project.color}40` // 40% opacity border
        }}
      >
        {/* Featured Project Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: project.color }}
        >
          <IconComponent
            className="w-5 h-5 text-white"
          />
        </div>

        {/* Project Details */}
        <div className="min-w-0 flex-1">
          <div
            className="font-semibold text-sm truncate mb-1"
            style={{ color: theme.text.primary }}
          >
            {project.name}
          </div>
          {project.tasksDue && (
            <div
              className="text-xs flex items-center gap-1"
              style={{ color: theme.text.secondary }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              {project.tasksDue} tasks due soon
            </div>
          )}
        </div>
      </div>
    );
  };

  // Create Project Button Component
  const CreateProjectButton = () => (
    <button
      className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-12 transition-colors"
      style={{
        borderColor: theme.border.default,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <FaPlus
        className="w-3 h-3 mb-1"
        style={{ color: theme.text.secondary }}
      />
      <span
        className="text-xs"
        style={{ color: theme.text.secondary }}
      >
        Create project
      </span>
    </button>
  );

  // Custom Header Component for Projects
  const ProjectsHeader = () => (
    <div className="flex items-center gap-2 mb-3">
      <button className="flex items-center gap-1">
        <span
          className="text-xs"
          style={{ color: theme.text.secondary }}
        >
          Recents
        </span>
        <MdKeyboardArrowDown className="w-3 h-3" style={{ color: theme.text.secondary }} />
      </button>
    </div>
  );

  // Business Logic using Hook
  const handleCreateProject = () => {
    // Example: Add a new projects
    addProject({
      name: "New Project",
      color: "#8b5cf6",
      icon: GrProjects,
      status: 'active'
    });
  };

  const handleMenuClick = () => {
    console.log("Projects menu clicked - Total projects:", projectStats.total);
  };

  // BaseCard Configuration
  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: "Create projects",
    onClick: handleCreateProject
  };

  const showMoreButton = {
    show: hasMoreProjects && !showAllProjects,
    onClick: toggleShowAll
  };

  return (
    <BaseCard
      title="Projects"
      createAction={createAction}
      showMoreButton={showMoreButton}
      onMenuClick={handleMenuClick}
    >
      <div className="space-y-3">
        {/* Custom Header */}
        <ProjectsHeader />

        {/* Projects Grid Layout - Dynamic Grid Based on Show More State */}
        <div className={`grid grid-cols-2 gap-3 ${showAllProjects ? 'auto-rows-fr' : ''}`}>
          {/* Create Project Button */}
          <CreateProjectButton />

          {/* Featured Project */}
          {featuredProject && <FeaturedProject project={featuredProject} />}

          {/* Regular Projects - From Hook */}
          {displayedProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </BaseCard>
  );
};

export default ProjectsCard;