"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GrProjects } from "react-icons/gr";
import { useMyProjects } from "@/hooks/projects/useProjects";
import type { ProjectResponseDto } from "@/types/projects";

// Professional ProjectsCard using BaseCard & Real SWR API Integration
const ProjectsCard = () => {
  const { theme } = useTheme();
  const router = useRouter();

  // Use SWR hook with revalidation settings
  const { data: projectsData, isLoading: loading, error, mutate } = useMyProjects();
  
  // Local state for show more functionality
  const [showAllProjects, setShowAllProjects] = React.useState(false);
  const initialLimit = 4;
  
  // Revalidate data on mount and when component becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        mutate();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mutate]);

  // Extract projects array with null safety
  const projects = React.useMemo(() => {
    if (!projectsData) return [];
    // Handle both array response and paginated response
    return Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
  }, [projectsData]);

  // Process real API data
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [projects]);

  const featuredProject = sortedProjects[0]; // Most recently updated as featured
  const regularProjects = sortedProjects.slice(1);
  const displayedProjects = showAllProjects ? regularProjects : regularProjects.slice(0, initialLimit);
  const hasMoreProjects = regularProjects.length > initialLimit;

  // Project Item Component - Same hover effects as Featured Project
  const ProjectItem = ({ project }: { project: ProjectResponseDto }) => {
    const IconComponent = GrProjects; // Use default icon for API projects

    const handleProjectClick = () => {
      router.push(`/projects/${project.id}`);
    };

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={handleProjectClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Project Icon with Professional Styling */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: '#8b5cf6' }} // Default purple color
        >
          <IconComponent
            className="w-5 h-5 text-white"
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

  // Featured Project Component - Large size w-10 h-10
  const FeaturedProject = ({ project }: { project: ProjectResponseDto }) => {
    const IconComponent = GrProjects; // Use default icon for API projects

    const handleFeaturedProjectClick = () => {
      router.push(`/projects/${project.id}`);
    };

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={handleFeaturedProjectClick}
        style={{
          backgroundColor: '#8b5cf620', // 20% opacity purple
          border: '1px solid #8b5cf640' // 40% opacity purple border
        }}
      >
        {/* Featured Project Icon - Large size */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: '#8b5cf6' }}
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
          <div
            className="text-xs flex items-center gap-1"
            style={{ color: theme.text.secondary }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {project.status || 'Active'}
          </div>
        </div>
      </div>
    );
  };

  // Create Project Button Component - Same hover effects as Featured Project
  const CreateProjectButton = () => (
    <button
      className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105"
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
      {/* Plus Icon Container - Large size matching project icons */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ 
          backgroundColor: theme.background.secondary,
          border: `1px dashed ${theme.border.default}`
        }}
      >
        <FaPlus
          className="w-5 h-5"
          style={{ color: theme.text.secondary }}
        />
      </div>

      {/* Create Project Text - Same styling as project name */}
      <span
        className="text-sm font-medium truncate"
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

  // Business Logic with Real API
  const handleCreateProject = () => {
    // TODO: Implement project creation modal
    console.log("Create project clicked");
  };

  const handleMenuClick = () => {
    console.log("Projects menu clicked - Total projects:", projects.length);
  };

  const toggleShowAll = () => {
    setShowAllProjects(prev => !prev);
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

  // Loading state
  if (loading) {
    return (
      <BaseCard title="Projects">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm" style={{ color: theme.text.secondary }}>
            Loading projects...
          </div>
        </div>
      </BaseCard>
    );
  }

  // Error state
  if (error) {
    return (
      <BaseCard title="Projects">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">
            Failed to load projects
          </div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard
      title="Projects"
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

          {/* Regular Projects - From Real API */}
          {displayedProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>

        {/* No projects state */}
        {projects.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm" style={{ color: theme.text.secondary }}>
              No projects found
            </div>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default ProjectsCard;