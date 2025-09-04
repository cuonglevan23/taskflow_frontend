"use client";

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';
import { DARK_THEME } from '@/constants/theme';
import { NoteFormProps, CreateNoteRequest, UpdateNoteRequest } from '@/types/note';
import NoteEditor from './NoteEditor';

const NoteForm = ({
  mode,
  initialData,
  projectId,
  onSubmit,
  onCancel,
  isLoading = false
}: NoteFormProps) => {
  const [title, setTitle] = useState(initialData?.title || (mode === 'create' ? 'Untitled Note' : ''));
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState<string>('');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse initial content
  useEffect(() => {
    if (initialData?.content) {
      setContent(initialData.content);
    }
  }, [initialData?.content]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        const data: CreateNoteRequest = {
          title: title.trim(),
          content: content,
          description: description.trim() || undefined,
          projectId,
          isPublic: projectId ? isPublic : false
        };
        await onSubmit(data);
      } else {
        const data: UpdateNoteRequest = {
          title: title.trim(),
          content: content,
          description: description.trim() || undefined,
          isPublic: projectId ? isPublic : undefined
        };
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
    }
  }, [mode, title, description, content, projectId, isPublic, onSubmit, validateForm]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div
      className="note-form max-w-4xl mx-auto p-6 rounded-lg"
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        border: `1px solid ${DARK_THEME.border.default}`
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: DARK_THEME.text.primary }}
        >
          {mode === 'create' ? 'Create New Note' : 'Edit Note'}
        </h2>
        <p style={{ color: DARK_THEME.text.muted }}>
          {projectId ? 'Create a note for this project' : 'Create a personal note'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            maxLength={255}
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors"
            style={{
              backgroundColor: DARK_THEME.background.primary,
              borderColor: errors.title ? DARK_THEME.button.success.text : DARK_THEME.border.default,
              color: DARK_THEME.text.primary,
            }}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm" style={{ color: DARK_THEME.button.success.text }}>
              {errors.title}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: DARK_THEME.text.muted }}>
            {title.length}/255 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            maxLength={1000}
            rows={3}
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors resize-vertical"
            style={{
              backgroundColor: DARK_THEME.background.primary,
              borderColor: errors.description ? DARK_THEME.button.success.text : DARK_THEME.border.default,
              color: DARK_THEME.text.primary,
            }}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm" style={{ color: DARK_THEME.button.success.text }}>
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: DARK_THEME.text.muted }}>
            {description.length}/1000 characters
          </p>
        </div>

        {/* Public/Private toggle for project notes */}
        {projectId && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2"
              style={{
                accentColor: DARK_THEME.button.primary.background,
                borderColor: DARK_THEME.border.default
              }}
              disabled={isLoading}
            />
            <label
              htmlFor="isPublic"
              className="ml-2 text-sm cursor-pointer"
              style={{ color: DARK_THEME.text.primary }}
            >
              Make this note public (visible to all team members)
            </label>
          </div>
        )}

        {/* Content Editor */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            Content
          </label>
          <div className="border rounded-md overflow-hidden" style={{ borderColor: DARK_THEME.border.default }}>
            <NoteEditor
              initialContent={content}
              onContentChange={handleContentChange}
              readOnly={isLoading}
              placeholder="Start writing your note..."
              className="min-h-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: DARK_THEME.border.default }}>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm"
          style={{
            color: DARK_THEME.text.muted,
            borderColor: DARK_THEME.border.default
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !title.trim()}
          className="px-6 py-2 text-sm font-medium rounded-md transition-colors"
          style={{
            backgroundColor: isLoading || !title.trim()
              ? DARK_THEME.background.muted
              : DARK_THEME.button.primary.background,
            color: isLoading || !title.trim()
              ? DARK_THEME.text.muted
              : DARK_THEME.button.primary.text,
            cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </span>
          ) : (
            mode === 'create' ? 'Create Note' : 'Update Note'
          )}
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: DARK_THEME.border.muted }}>
        <p className="text-xs text-center" style={{ color: DARK_THEME.text.muted }}>
          Press Ctrl+Enter (Cmd+Enter) to save
        </p>
      </div>
    </div>
  );
};

export default NoteForm;
