"use client";

import { useCallback } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { DARK_THEME } from '@/constants/theme';
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
    title = 'Notes',
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

  const handleCreateNote = useCallback(async () => {
    // If onNoteClick is provided, use state management instead of navigation
    if (onNoteClick && typeof onCreateNote === 'function') {
      // This will be handled by parent component
      return;
    }

    // Fallback to navigation for backward compatibility
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

      router.push(`/my-tasks/notes/${newNote.id}`);
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

  return (
    <div className={`note-list ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6 pb-4 border-b"
        style={{ borderColor: DARK_THEME.border.default }}
      >
        <div>
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            <FileText className="h-5 w-5" />
            {title}
          </h2>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: DARK_THEME.text.muted }}>
            <span>{notes.length} notes</span>
          </div>
        </div>

        <Button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{
            backgroundColor: DARK_THEME.button.primary.background,
            color: DARK_THEME.button.primary.text
          }}
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <NoteSearch
          onSearch={onSearch}
          placeholder={projectId ? "Search project notes..." : "Search personal notes..."}
          showAdvancedFilters={true}
        />
      </div>

      {/* Error State */}
      {error && (
        <div
          className="mb-6 p-4 rounded-md border-l-4"
          style={{
            backgroundColor: DARK_THEME.button.success.background + '10',
            borderLeftColor: DARK_THEME.button.success.border,
            color: DARK_THEME.button.success.text
          }}
        >
          <p className="text-sm font-medium">Error loading notes</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && notes.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2
              className="h-8 w-8 animate-spin mx-auto mb-3"
              style={{ color: DARK_THEME.text.muted }}
            />
            <p className="text-sm" style={{ color: DARK_THEME.text.muted }}>
              Loading notes...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && !error && (
        <div className="text-center py-12">
          <FileText
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: DARK_THEME.text.muted }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            No notes yet
          </h3>
          <p className="text-sm mb-6" style={{ color: DARK_THEME.text.muted }}>
            {projectId
              ? "No project notes available."
              : "No personal notes available."
            }
          </p>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 && (
        <div
          className="space-y-4 overflow-y-auto"
          style={{ maxHeight }}
        >
          {notes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              onEdit={handleNoteClick}
              onDelete={handleDeleteNote}
              onArchive={handleArchiveNote}
              onToggleVisibility={projectId ? handleToggleVisibility : undefined}
              showProjectInfo={showProjectInfo}
            />
          ))}

          {/* Pagination info */}
          <div className="text-center pt-4 text-xs" style={{ color: DARK_THEME.text.muted }}>
            Showing {notes.length} notes
          </div>
        </div>
      )}
    </div>
  );
};
