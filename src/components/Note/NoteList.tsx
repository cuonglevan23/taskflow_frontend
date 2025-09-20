"use client";

import { useCallback } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import {
  NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteSearchParams
} from '@/types/note';
import NoteListItem from './NoteListItem';
import NoteSearch from './NoteSearch';

interface NoteListProps {
  notes: NoteResponse[];
  loading: boolean;
  error: string | null;
  title?: string;
  showProjectInfo?: boolean;
  maxHeight?: string;
  className?: string;
  onCreateNote: (data: CreateNoteRequest) => Promise<NoteResponse>;
  onUpdateNote: (id: number, data: UpdateNoteRequest) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  onArchiveNote: (id: number, archived: boolean) => Promise<void>;
  onToggleVisibility?: (id: number, isPublic: boolean) => Promise<void>;
  onSearch: (params: NoteSearchParams) => void;
  onNoteClick?: (noteId: number) => void;
  projectId?: number;
}

export default function NoteList(props: NoteListProps) {
  const {
    notes,
    loading,
    error,
    title,
    showProjectInfo = false,
    maxHeight = '600px',
    className = '',
    onCreateNote,
    onDeleteNote,
    onArchiveNote,
    onToggleVisibility,
    onSearch,
    onNoteClick,
    projectId
  } = props;

  const router = useRouter();
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

  const handleCreateNote = useCallback(async () => {
    try {
      const newNote = await onCreateNote({
        title: '',
        content: JSON.stringify([{
          type: "paragraph",
          content: []
        }]),
        description: '',
        projectId: projectId
      });

      // If onNoteClick is provided, use state management instead of navigation
      if (onNoteClick) {
        onNoteClick(newNote.id);
      } else {
        // Fallback to navigation for backward compatibility
        router.push(`/my-tasks/notes/${newNote.id}`);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }, [onCreateNote, onNoteClick, projectId, router]);

  const handleNoteClick = useCallback((note: NoteResponse) => {
    // If onNoteClick prop is provided, use it (state management)
    if (onNoteClick) {
      onNoteClick(note.id);
    } else {
      // Fallback to navigation for backward compatibility
      router.push(`/my-tasks/notes/${note.id}`);
    }
  }, [onNoteClick, router]);

  const handleDeleteNote = useCallback(async (noteId: number) => {
    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [onDeleteNote]);

  const handleArchiveNote = useCallback(async (noteId: number, archived: boolean) => {
    try {
      await onArchiveNote(noteId, archived);
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  }, [onArchiveNote]);

  const handleToggleVisibility = useCallback(async (noteId: number, isPublic: boolean) => {
    if (onToggleVisibility) {
      try {
        await onToggleVisibility(noteId, isPublic);
      } catch (error) {
        console.error('Failed to toggle visibility:', error);
      }
    }
  }, [onToggleVisibility]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-sm" style={{ color: theme.status.error }}>
            {t('notes.error.loadFailed')}
          </p>
          <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`note-list ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6 pb-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <div>
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: theme.text.primary }}
          >
            <FileText className="h-5 w-5" />
            {title || t('notes.title')}
          </h2>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: theme.text.muted }}>
            <span>{notes.length} {t('notes.stats.notesCount')}</span>
          </div>
        </div>

        <Button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{
            backgroundColor: theme.button.primary.background,
            color: theme.button.primary.text
          }}
        >
          <Plus className="h-4 w-4" />
          {t('notes.actions.newNote')}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <NoteSearch onSearch={onSearch} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2" style={{ color: theme.text.muted }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t('notes.loading')}</span>
          </div>
        </div>
      )}

      {/* Notes List */}
      {!loading && (
        <div
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight }}
        >
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 mb-4" style={{ color: theme.text.muted }} />
              <p className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
                {t('notes.empty.title')}
              </p>
              <p className="text-sm text-center mb-4" style={{ color: theme.text.muted }}>
                {t('notes.empty.description')}
              </p>
              <Button
                onClick={handleCreateNote}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                style={{
                  backgroundColor: theme.button.primary.background,
                  color: theme.button.primary.text
                }}
              >
                <Plus className="h-4 w-4" />
                {t('notes.actions.createFirst')}
              </Button>
            </div>
          ) : (
            notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                showProjectInfo={showProjectInfo}
                onEdit={() => handleNoteClick(note)}
                onDelete={() => handleDeleteNote(note.id)}
                onArchive={(archived) => handleArchiveNote(note.id, archived)}
                onToggleVisibility={onToggleVisibility ? (isPublic) => handleToggleVisibility(note.id, isPublic) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
