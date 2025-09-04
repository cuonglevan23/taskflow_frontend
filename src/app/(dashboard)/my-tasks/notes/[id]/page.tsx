"use client";

import { useParams } from 'next/navigation';
import NoteDetailLayout from '@/components/Note/NoteDetailLayout';
import { useNoteDetail } from '@/hooks/useNoteDetail';

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = parseInt(params.id as string);

  const { note, loading, error, updateNote } = useNoteDetail({ noteId });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load note</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Full-screen note detail without dashboard padding/margins
  return (
    <div className="fixed inset-0 z-50">
      <NoteDetailLayout
        note={note}
        onUpdateNote={updateNote}
      />
    </div>
  );
}
