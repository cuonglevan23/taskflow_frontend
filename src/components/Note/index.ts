export { default as Note } from "./Note";
export { default as NoteEditor } from "./NoteEditor";
export { default as NoteViewer } from "./NoteViewer";

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
