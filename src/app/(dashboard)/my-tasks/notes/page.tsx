"use client";

import { useCallback, useState } from 'react';
import { useNotes } from '@/components/Note';
import NoteList from '@/components/Note/NoteList';
import NoteDetailLayout from '@/components/Note/NoteDetailLayout';
import { CreateNoteRequest, UpdateNoteRequest, NoteSearchParams } from '@/types/note';

const MyTaskNotesPage = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  // Chỉ sử dụng useNotes hook đơn giản để load personal notes
  const { notes, loading, error, actions } = useNotes({
    initialFilters: { isArchived: false },
    pageSize: 50,
    autoRefresh: false
  });

  const handleSearch = useCallback((params: NoteSearchParams) => {
    actions.searchNotes(params);
  }, [actions]);

  // Wrapper functions to match NoteList interface expectations
  const handleUpdateNote = useCallback(async (id: number, data: UpdateNoteRequest) => {
    await actions.updateNote(id, data);
  }, [actions]);

  const handleArchiveNote = useCallback(async (id: number, archived: boolean) => {
    await actions.archiveNote(id, archived);
  }, [actions]);

  const handleToggleVisibility = useCallback(async (id: number, isPublic: boolean) => {
    await actions.toggleVisibility(id, isPublic);
  }, [actions]);

  // Handle note click - show detail in same page
  const handleNoteClick = useCallback((noteId: number) => {
    setSelectedNoteId(noteId);
  }, []);

  // Handle back to list
  const handleBackToList = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  // Handle create note - create and show detail
  const handleCreateNote = useCallback(async (data: CreateNoteRequest) => {
    try {
      const newNote = await actions.createNote({
        title: data.title || '',
        content: data.content || JSON.stringify([{
          type: "paragraph",
          content: []
        }]),
        description: data.description || '',
        projectId: data.projectId,
        isPublic: data.isPublic
      });
      setSelectedNoteId(newNote.id);
      return newNote; // Return the created note
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error; // Re-throw to let caller handle
    }
  }, [actions]);

  // Find selected note
  const selectedNote = selectedNoteId ? notes.find(note => note.id === selectedNoteId) : null;

  // If a note is selected, show detail view
  if (selectedNoteId && selectedNote) {
    return (
      <div className="h-full w-full">
        <NoteDetailLayout
          note={selectedNote}
          onUpdateNote={handleUpdateNote}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Show notes list
  return (
    <div className="p-6">
      <NoteList
        notes={notes}
        loading={loading}
        error={error}
        title=""
        showProjectInfo={false}
        maxHeight="calc(100vh - 200px)"
        className="max-w-6xl mx-auto"
        onCreateNote={handleCreateNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={actions.deleteNote}
        onArchiveNote={handleArchiveNote}
        onToggleVisibility={handleToggleVisibility}
        onSearch={handleSearch}
        onNoteClick={handleNoteClick}
      />
    </div>
  );
};

export default MyTaskNotesPage;
