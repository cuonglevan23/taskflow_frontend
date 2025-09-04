"use client";

import { useState, useCallback } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { DARK_THEME } from '@/constants/theme';
import {
  NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteSearchParams
} from '@/types/note';
import { useNotes } from '@/hooks/useNotes';
import NoteForm from './NoteForm';
import NoteListItem from './NoteListItem';
import NoteSearch from './NoteSearch';

interface NoteManagerProps {
  projectId?: number;
  title?: string;
  showProjectInfo?: boolean;
  maxHeight?: string;
  className?: string;
}

type ViewMode = 'list' | 'create' | 'edit';

const NoteManager = ({
  projectId,
  title = 'Notes',
  showProjectInfo = false,
  maxHeight = '600px',
  className = ''
}: NoteManagerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNote, setSelectedNote] = useState<NoteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    notes,
    loading,
    error,
    pagination,
    stats,
    actions
  } = useNotes({
    projectId,
    pageSize: 20,
    autoRefresh: true
  });

  const handleCreateNote = useCallback(() => {
    setSelectedNote(null);
    setViewMode('create');
  }, []);

  const handleEditNote = useCallback((note: NoteResponse) => {
    setSelectedNote(note);
    setViewMode('edit');
  }, []);

  const handleCancelForm = useCallback(() => {
    setSelectedNote(null);
    setViewMode('list');
  }, []);

  const handleSubmitForm = useCallback(async (data: CreateNoteRequest | UpdateNoteRequest) => {
    setIsSubmitting(true);
    try {
      if (viewMode === 'create') {
        await actions.createNote(data as CreateNoteRequest);
      } else if (viewMode === 'edit' && selectedNote) {
        await actions.updateNote(selectedNote.id, data as UpdateNoteRequest);
      }
      setViewMode('list');
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to submit note:', error);
      // Error is handled in the hook and displayed via error state
    } finally {
      setIsSubmitting(false);
    }
  }, [viewMode, selectedNote, actions]);

  const handleDeleteNote = useCallback(async (noteId: number) => {
    try {
      await actions.deleteNote(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [actions]);

  const handleArchiveNote = useCallback(async (noteId: number, archived: boolean) => {
    try {
      await actions.archiveNote(noteId, archived);
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  }, [actions]);

  const handleToggleVisibility = useCallback(async (noteId: number, isPublic: boolean) => {
    try {
      await actions.toggleVisibility(noteId, isPublic);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  }, [actions]);

  const handleSearch = useCallback((searchParams: NoteSearchParams) => {
    actions.searchNotes(searchParams);
  }, [actions]);

  const handleLoadMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      actions.loadMore();
    }
  }, [pagination, actions]);

  if (viewMode === 'create') {
    return (
      <div className={`note-manager ${className}`}>
        <NoteForm
          mode="create"
          projectId={projectId}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && selectedNote) {
    return (
      <div className={`note-manager ${className}`}>
        <NoteForm
          mode="edit"
          initialData={selectedNote}
          projectId={projectId}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className={`note-manager ${className}`}>
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
            <span>{stats.totalNotes} total</span>
            {stats.archivedNotes > 0 && (
              <span>{stats.archivedNotes} archived</span>
            )}
            {projectId && (
              <>
                <span>{stats.publicNotes} public</span>
                <span>{stats.privateNotes} private</span>
              </>
            )}
            {stats.notesWithAttachments > 0 && (
              <span>{stats.notesWithAttachments} with files</span>
            )}
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
          onSearch={handleSearch}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.refresh}
            className="mt-2 text-xs"
            style={{ color: DARK_THEME.button.success.text }}
          >
            Try again
          </Button>
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
              ? "Create your first project note to get started."
              : "Create your first personal note to get started."
            }
          </p>
          <Button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
            style={{
              backgroundColor: DARK_THEME.button.primary.background,
              color: DARK_THEME.button.primary.text
            }}
          >
            <Plus className="h-4 w-4" />
            Create First Note
          </Button>
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
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onArchive={handleArchiveNote}
              onToggleVisibility={projectId ? handleToggleVisibility : undefined}
              showProjectInfo={showProjectInfo}
            />
          ))}

          {/* Load More */}
          {pagination.currentPage < pagination.totalPages - 1 && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 text-sm"
                style={{
                  borderColor: DARK_THEME.border.default,
                  color: DARK_THEME.text.primary
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `Load More (${pagination.totalElements - notes.length} remaining)`
                )}
              </Button>
            </div>
          )}

          {/* Pagination info */}
          <div className="text-center pt-4 text-xs" style={{ color: DARK_THEME.text.muted }}>
            Showing {notes.length} of {pagination.totalElements} notes
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteManager;
