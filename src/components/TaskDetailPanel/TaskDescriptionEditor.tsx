import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { DARK_THEME } from '@/constants/theme';

interface TaskDescriptionEditorProps {
  description: string;
  setDescription: (description: string) => void;
  onSaveDescription?: (newDescription: string) => void;
}

const TaskDescriptionEditor: React.FC<TaskDescriptionEditorProps> = ({
  description,
  setDescription,
  onSaveDescription
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update tempDescription when description prop changes
  useEffect(() => {
    if (!isEditingDescription) {
      setTempDescription(description);
    }
  }, [description, isEditingDescription]);

  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
    setTempDescription(description);
  };

  const handleDescriptionSave = useCallback(() => {
    // Update description locally first
    setDescription(tempDescription);
    setIsEditingDescription(false);

    // Delayed save to backend without closing panel
    if (onSaveDescription) {
      // Use setTimeout to prevent immediate callback execution that might close panel
      setTimeout(() => {
        onSaveDescription(tempDescription);
      }, 100);
    }
  }, [tempDescription, setDescription, onSaveDescription]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditingDescription) {
        if (event.key === 'Escape') {
          setIsEditingDescription(false);
          setTempDescription(description);
        }
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          handleDescriptionSave();
        }
      }
    };

    if (isEditingDescription) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingDescription, handleDescriptionSave, description]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Description</h3>
      {isEditingDescription ? (
        <div className="space-y-3">
          <div
            ref={editorRef}
            className="min-h-[120px] border rounded-lg overflow-hidden"
            style={{ borderColor: DARK_THEME.border.default }}
          >
            <MinimalTiptap
              content={tempDescription}
              onChange={setTempDescription}
              placeholder="Add a description..."
            />
          </div>
          {/* Save/Cancel buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDescriptionSave();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditingDescription(false);
                setTempDescription(description);
              }}
              className="text-gray-400 hover:text-gray-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="min-h-[120px] border rounded-lg p-4 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200"
          style={{ borderColor: DARK_THEME.border.default }}
          onClick={handleDescriptionClick}
        >
          {description ? (
            <div
              className="text-gray-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-gray-400 italic">Click to add a description...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDescriptionEditor;
