import React, { useState, useCallback, useEffect } from 'react';
import { Save, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { useTaskDescription } from '@/hooks/useComments';
import { DARK_THEME } from '@/constants/theme';

interface DescriptionEditorProps {
  taskId: string | null;
  description: string;
  onDescriptionChange: (description: string) => void;
  editable?: boolean;
}

const DescriptionEditor = ({
  taskId,
  description,
  onDescriptionChange,
  editable = true,
}: DescriptionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localDescription, setLocalDescription] = useState(description);
  const [hasChanges, setHasChanges] = useState(false);

  const { updateDescription, isUpdating } = useTaskDescription(taskId);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalDescription(description);
    setHasChanges(false);
  }, [description]);

  const handleContentChange = useCallback((content: string) => {
    setLocalDescription(content);
    setHasChanges(content !== description);
    // Optimistic update for immediate UI feedback
    onDescriptionChange(content);
  }, [description, onDescriptionChange]);

  const handleSave = useCallback(async () => {
    if (!taskId || !hasChanges) return;

    try {
      await updateDescription(localDescription);
      setHasChanges(false);
      setIsEditing(false);
    } catch (error) {
      // Revert optimistic update on error
      setLocalDescription(description);
      onDescriptionChange(description);
      console.error('Failed to save description:', error);
    }
  }, [taskId, localDescription, hasChanges, updateDescription, description, onDescriptionChange]);

  const handleCancel = useCallback(() => {
    setLocalDescription(description);
    onDescriptionChange(description);
    setHasChanges(false);
    setIsEditing(false);
  }, [description, onDescriptionChange]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Auto-save on blur if there are changes
  const handleBlur = useCallback(() => {
    if (hasChanges && !isUpdating) {
      handleSave();
    }
  }, [hasChanges, isUpdating, handleSave]);

  if (!editable) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <div 
          className="rounded-lg p-4 border min-h-[100px]"
          style={{
            backgroundColor: DARK_THEME.background.weakHover,
            borderColor: DARK_THEME.border.default
          }}
        >
          {description ? (
            <div 
              className="text-sm text-gray-200"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="text-gray-400 text-sm italic">No description provided</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-200 text-xs h-7 px-2"
                disabled={isUpdating}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3"
                disabled={isUpdating || !hasChanges}
              >
                <Save className="w-3 h-3 mr-1" />
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
          {!isEditing && !hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-gray-400 hover:text-gray-200 text-xs h-7 px-2"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="transition-all duration-300 ease-in-out transform">
        <MinimalTiptap
          content={localDescription}
          onChange={handleContentChange}
          placeholder="What is this task about?"
          editable={isEditing || hasChanges}
          className={`
            ${isEditing || hasChanges ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            transition-all duration-200
          `}
        />
      </div>

      {hasChanges && (
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
          Unsaved changes
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
