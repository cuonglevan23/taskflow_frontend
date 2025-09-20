"use client";

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
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
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const [title, setTitle] = useState(initialData?.title || (mode === 'create' ? t('noteForm.defaultTitle') : ''));
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
      newErrors.title = t('noteForm.validation.titleRequired');
    } else if (title.length > 255) {
      newErrors.title = t('noteForm.validation.titleTooLong');
    }

    if (description && description.length > 1000) {
      newErrors.description = t('noteForm.validation.descriptionTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        const createData: CreateNoteRequest = {
          title: title.trim(),
          content,
          description: description.trim(),
          projectId: projectId,
          isPublic
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateNoteRequest = {
          title: title.trim(),
          content,
          description: description.trim(),
          isPublic
        };
        await onSubmit(updateData);
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
    }
  }, [mode, title, content, description, projectId, isPublic, onSubmit, validateForm]);

  return (
    <div
      className="note-form max-w-4xl mx-auto p-6 rounded-lg"
      style={{
        backgroundColor: theme.background.secondary,
        border: `1px solid ${theme.border.default}`
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: theme.text.primary }}
        >
          {mode === 'create' ? t('noteForm.title.create') : t('noteForm.title.edit')}
        </h2>
        <p style={{ color: theme.text.muted }}>
          {projectId ? t('noteForm.subtitle.project') : t('noteForm.subtitle.personal')}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('noteForm.fields.title')} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('noteForm.placeholders.title')}
            maxLength={255}
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: errors.title ? theme.status.error : theme.border.default,
              color: theme.text.primary,
            }}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm" style={{ color: theme.status.error }}>
              {errors.title}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
            {title.length}/255 {t('noteForm.labels.characters')}
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('noteForm.fields.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('noteForm.placeholders.description')}
            maxLength={1000}
            rows={3}
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors resize-vertical"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: errors.description ? theme.status.error : theme.border.default,
              color: theme.text.primary,
            }}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm" style={{ color: theme.status.error }}>
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: theme.text.muted }}>
            {description.length}/1000 {t('noteForm.labels.characters')}
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
                accentColor: theme.button.primary.background,
                borderColor: theme.border.default
              }}
              disabled={isLoading}
            />
            <label
              htmlFor="isPublic"
              className="ml-2 text-sm cursor-pointer"
              style={{ color: theme.text.primary }}
            >
              {t('noteForm.fields.makePublic')}
            </label>
          </div>
        )}

        {/* Content Editor */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('noteForm.fields.content')}
          </label>
          <div className="border rounded-md overflow-hidden" style={{ borderColor: theme.border.default }}>
            <NoteEditor
              initialContent={content}
              onContentChange={setContent}
              readOnly={isLoading}
              placeholder={t('noteForm.placeholders.content')}
              className="min-h-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: theme.border.default }}>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm"
          style={{
            color: theme.text.muted,
            borderColor: theme.border.default
          }}
        >
          {t('noteForm.actions.cancel')}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !title.trim()}
          className="px-6 py-2 text-sm font-medium rounded-md transition-colors"
          style={{
            backgroundColor: isLoading || !title.trim()
              ? theme.background.muted
              : theme.button.primary.background,
            color: isLoading || !title.trim()
              ? theme.text.muted
              : theme.button.primary.text,
            cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
              {mode === 'create' ? t('noteForm.actions.creating') : t('noteForm.actions.updating')}
            </span>
          ) : (
            mode === 'create' ? t('noteForm.actions.create') : t('noteForm.actions.update')
          )}
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.border.muted }}>
        <p className="text-xs text-center" style={{ color: theme.text.muted }}>
          {t('noteForm.hints.keyboardShortcut')}
        </p>
      </div>
    </div>
  );
};

export default NoteForm;
