"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { ProjectsList} from "@/components/teams/AllWork";
import { useTeamProjects } from "@/hooks/projects/useProjects";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

const AllWorkPage = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Memoized teamId parsing for Next.js 15 optimization
  const teamId = useMemo(() => {
    const id = params.id as string;
    return parseInt(id, 10);
  }, [params.id]);

  // Fetch team projects using established service pattern
  const { 
    data: projectsData, 
    isLoading: projectsLoading, 
    error: projectsError,
    mutate: refetchProjects 
  } = useTeamProjects(teamId, {
    page: 0,
    size: 20
  });

  // Memoized projects data following service response structure
  const projects = useMemo(() => {
    return (projectsData?.projects || []).map(project => ({
      ...project,
      id: project.id.toString(), // Convert number id to string
      color: theme.status.info, // Add default color for ProjectsList component
      status: project.status === 'COMPLETED' ? 'Complete' : 'Joined' // Map API status to component expected status
    }));
  }, [projectsData?.projects, theme.status.info]);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Stable event handlers to prevent re-renders
  const handleNewProject = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleNewTemplate = useCallback(() => {
    // TODO: Open create template modal
  }, []);

  const handleExploreTemplates = useCallback(() => {
    // TODO: Navigate to templates page
    router.push(`/teams/${teamId}/templates`);
  }, [router, teamId]);

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, [router]);

  const handleTemplateClick = useCallback((templateId: string) => {
    // TODO: Navigate to template details or create from template
  }, []);

  const handleProjectCreated = useCallback(() => {
    setShowCreateModal(false);
    // Refresh projects list
    refetchProjects();
  }, [refetchProjects]);

  // Handle error state
  if (projectsError) {
    return (
      <div 
        className="min-h-screen p-6 flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <p style={{ color: theme.status.error }} className="mb-4">
            {messages.errors?.failedToLoadTeamProjects || 'Failed to load team projects'}: {projectsError.message}
          </p>
          <button
            onClick={() => refetchProjects()}
            className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: theme.status.info,
              color: theme.text.inverse
            }}
          >
            {messages.common?.retry || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left Column - Projects */}
        <div className="flex-1 lg:max-w-2xl">
          <ProjectsList 
            projects={projects}
            loading={projectsLoading}
            onNewProject={handleNewProject}
            onProjectClick={handleProjectClick}
            onRefresh={() => refetchProjects()}
          />
        </div>


      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teamId={teamId}
        onCreateProject={handleProjectCreated}
      />
    </div>
  );
});

AllWorkPage.displayName = 'AllWorkPage';

export default AllWorkPage;