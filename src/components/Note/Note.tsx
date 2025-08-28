"use client";

import { useState } from "react";
import NoteEditor from "./NoteEditor";

interface NoteProps {
  title?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  editable?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function Note({
  title = "Note",
  initialContent = "",
  onSave,
  onCancel,
  editable = true,
  showActions = true,
  className = "",
}: NoteProps) {
  const [content, setContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== initialContent);
  };

  const handleSave = () => {
    onSave?.(content);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setHasChanges(false);
    onCancel?.();
  };

  return (
    <div className={`note-container bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="note-header flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {showActions && editable && (
          <div className="flex gap-2">
            {hasChanges && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="note-content p-4">
        <NoteEditor
          initialContent={content}
          onContentChange={handleContentChange}
          editable={editable}
          className="min-h-[300px]"
        />
      </div>

      {/* Footer */}
      {showActions && hasChanges && (
        <div className="note-footer px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
          You have unsaved changes
        </div>
      )}
    </div>
  );
}
