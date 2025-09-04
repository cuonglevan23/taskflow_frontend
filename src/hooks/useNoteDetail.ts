import { useState, useEffect, useCallback } from 'react';
import { NoteResponse, UpdateNoteRequest } from '@/types/note';
import NoteApiService from '@/services/noteApi';

interface UseNoteDetailOptions {
  noteId: number;
}

interface UseNoteDetailReturn {
  note: NoteResponse | null;
  loading: boolean;
  error: string | null;
  updateNote: (id: number, data: UpdateNoteRequest) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  archiveNote: (id: number, archived: boolean) => Promise<void>;
}

export function useNoteDetail(options: UseNoteDetailOptions): UseNoteDetailReturn {
  const { noteId } = options;
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load note detail
  const loadNote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const noteData = await NoteApiService.getNoteById(noteId);
      setNote(noteData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load note';
      setError(errorMessage);
      console.error('Error loading note:', err);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  // Update note
  const updateNote = useCallback(async (id: number, data: UpdateNoteRequest) => {
    try {
      setError(null);
      const updatedNote = await NoteApiService.updateNote(id, data);
      setNote(updatedNote);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: number) => {
    try {
      setError(null);
      await NoteApiService.deleteNote(id);
      setNote(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Archive note
  const archiveNote = useCallback(async (id: number, archived: boolean) => {
    try {
      setError(null);
      const updatedNote = await NoteApiService.toggleArchiveNote(id, archived);
      setNote(updatedNote);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load note on mount or when noteId changes
  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId, loadNote]);

  return {
    note,
    loading,
    error,
    updateNote,
    deleteNote,
    archiveNote
  };
}
