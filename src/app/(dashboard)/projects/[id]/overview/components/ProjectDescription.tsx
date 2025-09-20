"use client";

import { useState, useEffect, useMemo } from 'react';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { useUpdateProject } from '@/hooks/projects';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProject } from '../../components/DynamicProjectProvider';

export function ProjectDescription() {
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const { user } = useAuth();

  // ✅ Use project from DynamicProjectProvider instead of individual hook
  const { project, loading: isLoading, error } = useProject();
  const { trigger: updateProject, isMutating } = useUpdateProject();
  
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Safe theme color access with fallbacks
  const getThemeColor = (colorPath: string, fallback: string = '') => {
    if (!theme) return fallback;
    const keys = colorPath.split('.');
    let value: any = theme;
    for (const key of keys) {
      value = value?.[key];
      if (!value) return fallback;
    }
    return value;
  };

  // Get translated messages from config/i18n/messages
  const descriptionMessages = messages?.projectOverview?.description || {};

  // Sync local state with fetched data
  useEffect(() => {
    if (project?.description !== undefined) {
      setDescription(project.description || '');
    }
  }, [project?.description]);

  const handleSave = async () => {
    if (!project) return;
    
    try {
      await updateProject({
        id: project.id,
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

  // Check if user can edit this project - updated to use correct property names
  const canEdit = useMemo(() => {
    if (!user || !project) return false;

    // System admin always can edit
    if (user.role === 'ADMIN') {
      console.log('✅ Permission granted: System Admin');
      return true;
    }

    // Check if user is project owner or creator
    const userIdNum = Number(user.id);
    if (project.createdById === userIdNum || project.ownerId === userIdNum) {
      return true;
    }

    // Check if user has OWNER role in this specific project
    if (project.currentUserRole === 'OWNER') {
      return true;
    }

    console.log('❌ Permission denied: No matching conditions');
    return false;
  }, [user, project]);

  // Show loading state while language is loading
  if (languageLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
        <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="font-semibold text-sm"
          style={{ color: getThemeColor('text.secondary', '#64748b') }}
        >
          {descriptionMessages.title || 'Mô tả dự án'}
        </div>
        <div
          className="h-24 animate-pulse rounded-md"
          style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
        ></div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="space-y-4">
        <div
          className="font-semibold text-sm"
          style={{ color: getThemeColor('text.secondary', '#64748b') }}
        >
          {descriptionMessages.title || 'Mô tả dự án'}
        </div>
        <div
          className="text-sm"
          style={{ color: getThemeColor('status.error', '#ef4444') }}
        >
          {descriptionMessages.failedToLoad || 'Không thể tải mô tả dự án'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="font-semibold text-sm"
        style={{ color: getThemeColor('text.secondary', '#64748b') }}
      >
        {descriptionMessages.title || 'Mô tả dự án'}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2"
            style={{
              borderColor: getThemeColor('border.default', '#e2e8f0'),
              backgroundColor: getThemeColor('background.primary', '#ffffff'),
              color: getThemeColor('text.primary', '#0f172a'),
              '--tw-ring-color': getThemeColor('status.info', '#3b82f6')
            } as React.CSSProperties}
            placeholder={descriptionMessages.placeholder || 'Mô tả dự án của bạn...'}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isMutating}
              className="px-3 py-1.5 text-sm rounded-md hover:opacity-80 disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: getThemeColor('status.info', '#3b82f6'),
                color: '#ffffff'
              }}
            >
              {isMutating ? (descriptionMessages.saving || 'Đang lưu...') : (descriptionMessages.save || 'Lưu')}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 border text-sm rounded-md transition-colors"
              style={{
                borderColor: getThemeColor('border.default', '#e2e8f0'),
                color: getThemeColor('text.primary', '#0f172a'),
                backgroundColor: getThemeColor('background.primary', '#ffffff')
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getThemeColor('background.secondary', '#f8fafc')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getThemeColor('background.primary', '#ffffff')}
            >
              {descriptionMessages.cancel || 'Hủy'}
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
            borderColor: getThemeColor('border.default', '#e2e8f0'),
            backgroundColor: getThemeColor('background.primary', '#ffffff'),
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = getThemeColor('border.focus', '#3b82f6')}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = getThemeColor('border.default', '#e2e8f0')}
        >
          {project.description ? (
            <div
              className="text-sm whitespace-pre-wrap"
              style={{ color: getThemeColor('text.primary', '#0f172a') }}
            >
              {project.description}
            </div>
          ) : (
            <div
              className="text-sm"
              style={{ color: getThemeColor('text.muted', '#64748b') }}
            >
              {canEdit
                ? (descriptionMessages.clickToAdd || 'Nhấp để thêm mô tả dự án...')
                : (descriptionMessages.noDescription || 'Không có mô tả')
              }
            </div>
          )}

        </div>
      )}
    </div>
  );
}