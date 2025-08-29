"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useUpdateProject, useProject } from '@/hooks/projects';
import { useAuth } from '@/components/auth/AuthProvider';

export function ProjectDescription() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const { theme } = useTheme();
  const { user } = useAuth();

  // ✅ Use SWR hooks following established architecture
  const { data: project, isLoading, error } = useProject(projectId);
  const { trigger: updateProject, isMutating } = useUpdateProject();
  
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync local state with fetched data
  useEffect(() => {
    if (project?.description !== undefined) {
      setDescription(project.description || '');
    }
  }, [project?.description]);

  const handleSave = async () => {
    if (!project) return;
    
    try {
      const updatedProject = await updateProject({
        id: projectId,
        data: { description }
      });
      
      // ✅ FIX: Optimistic local update for immediate UI feedback  
      setIsEditing(false);
      
      // SWR will automatically update the UI via mutation cache handling
      
    } catch (error) {
      console.error('Failed to update project description:', error);
      // Reset to original value on error
      setDescription(project.description || '');
    }
  };

  const handleCancel = () => {
    setDescription(project?.description || '');
    setIsEditing(false);
  };

  // Check if user can edit this project - updated to match backend permissions
  const canEdit = user?.role && ['MEMBER', 'LEADER', 'OWNER', 'PM', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  


  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Project description</div>
        <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="space-y-4">
        <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Project description</div>
        <div className="text-red-500 text-sm">Failed to load project description</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Project description</div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 text-sm border border-gray-200 rounded-md resize-none
             focus:outline-none focus:ring-2 focus:ring-blue-500
             text-white placeholder-white bg-gray-800"
              placeholder="Describe your project..."
          />

          <div className="flex gap-2">
            <button
                onClick={handleSave}
                disabled={isMutating}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isMutating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 border text-sm rounded-md transition-colors"
              style={{
                borderColor: theme.border.default,
                color: theme.text.primary,
                backgroundColor: theme.background.primary
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.background.primary}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => canEdit && setIsEditing(true)}
          className={`min-h-[100px] p-3 border rounded-md transition-colors ${
            canEdit ? 'cursor-text' : 'cursor-not-allowed'
          }`}
          style={{
            borderColor: theme.border.default,
            backgroundColor: theme.background.primary,
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.border.focus}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border.default}
        >
          {project.description ? (
            <div className="text-sm whitespace-pre-wrap" style={{ color: theme.text.primary }}>
              {project.description}
            </div>
          ) : (
            <div className="text-sm" style={{ color: theme.text.muted }}>
              {canEdit ? 'Click to add project description...' : 'No description available'}
            </div>
          )}
          
          {!canEdit && (
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              <span className="inline-flex items-center">
                🔒 Only authenticated project members can edit descriptions
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}