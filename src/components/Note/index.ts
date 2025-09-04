export { default as Note } from "./Note";
export { default as NoteEditor } from "./NoteEditor";
export { default as NoteViewer } from "./NoteViewer";
export { default as NoteForm } from "./NoteForm";
export { default as NoteList } from "./NoteList";
export { default as NoteListItem } from "./NoteListItem";
export { default as NoteSearch } from "./NoteSearch";
export { default as NoteAttachments } from "./NoteAttachments";
export { default as NoteManager } from "./NoteManager";
export { default as NoteDetailLayout } from "./NoteDetailLayout";

// Types
export interface NoteProps {
  title?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  editable?: boolean;
  showActions?: boolean;
  className?: string;
}

export interface NoteEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
}

export interface NoteViewerProps {
  content: string;
  title?: string;
  className?: string;
}

// Re-export types from the types file
export type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteResponse,
  NoteAttachmentResponse,
  NotePaginationResponse,
  NoteSearchParams,
  NoteFilter,
  NoteStats,
  NoteEditorProps,
  NoteListItemProps,
  NoteFormProps,
  NoteSearchProps,
  NoteAttachmentProps,
  UseNotesOptions,
  UseNotesReturn,
  UseNoteDetailOptions,
  UseNoteDetailReturn,
  NoteError,
  NoteApiError
} from "@/types/note";

// Re-export hooks
export { useNotes } from "@/hooks/useNotes";
export { useNoteDetail } from "@/hooks/useNoteDetail";

// Re-export service
export { default as NoteApiService } from "@/services/noteApi";
