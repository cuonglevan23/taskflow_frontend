"use client";

import { useState } from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';

export function ProjectDescription() {
  const { data, updateDescription, loading } = useProjectOverview();
  const { theme } = useTheme();
  const [description, setDescription] = useState(data.description);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await updateDescription(description);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(data.description);
    setIsEditing(false);
  };

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
                disabled={loading}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
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
          onClick={() => setIsEditing(true)}
          className="min-h-[100px] p-3 border rounded-md cursor-text transition-colors"
          style={{
            borderColor: theme.border.default,
            backgroundColor: theme.background.primary,
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.border.focus}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border.default}
        >
          {data.description ? (
            <div className="text-sm whitespace-pre-wrap" style={{ color: theme.text.primary }}>
              {data.description}
            </div>
          ) : (
            <div className="text-sm" style={{ color: theme.text.muted }}>
              Click to add project description...
            </div>
          )}
        </div>
      )}
    </div>
  );
}