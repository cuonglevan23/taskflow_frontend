"use client";

import { BlockNoteEditor, Block } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { DARK_THEME } from "@/constants/theme";

interface NoteEditorProps {
  initialContent?: Block[] | string;
  onContentChange?: (content: Block[]) => void;
  onSave?: (content: Block[]) => void;
  editable?: boolean;
  className?: string;
}

const NoteEditor = forwardRef<BlockNoteEditor, NoteEditorProps>(({
  initialContent,
  onContentChange,
  editable = true,
  className = "",
}, ref) => {

  // Parse initial content
  const parsedInitialContent = (() => {
    if (!initialContent) return undefined;
    if (typeof initialContent === 'string') {
      try {
        const parsed = JSON.parse(initialContent);
        return parsed && parsed.length > 0 ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    return initialContent && initialContent.length > 0 ? initialContent : undefined;
  })();

  // Tạo BlockNote editor
  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: parsedInitialContent,
  });

  // Expose editor instance through ref
  useImperativeHandle(ref, () => editor, [editor]);

  // Xử lý thay đổi nội dung
  const handleContentChange = useCallback(() => {
    const blocks = editor.document;
    onContentChange?.(blocks);
  }, [editor, onContentChange]);

  // Theo dõi thay đổi nội dung
  useEffect(() => {
    editor.onChange(handleContentChange);
  }, [editor, handleContentChange]);

  return (
    <div
      className={`note-editor ${className}`}
      style={{
        height: '100%',
        width: '100%',
        minHeight: '100%',
        backgroundColor: DARK_THEME.background.primary,

      }}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="dark"
        style={{
          backgroundColor: DARK_THEME.background.primary,
          color: DARK_THEME.text.primary,
          height: '100%',
          width: '100%',
          minHeight: '100%',
        }}
        className="block-note-full-height"
      />
      <style jsx global>{`
        .block-note-full-height {
          height: 100% !important;
          min-height: 100% !important;
          background-color: ${DARK_THEME.background.primary} !important;
        }
        .block-note-full-height .bn-container {
          height: 100% !important;
          min-height: 100% !important;
          background-color: ${DARK_THEME.background.primary} !important;
        }
        .block-note-full-height .bn-editor {
          height: 100% !important;
          min-height: 100% !important;
          padding: 0 !important;
          background-color: ${DARK_THEME.background.primary} !important;
        }
        .block-note-full-height .ProseMirror {
          height: 100% !important;
          min-height: 100% !important;
          padding: 20px 0px 0px 64px !important;
          background-color: ${DARK_THEME.background.primary} !important;
        }
        .block-note-full-height .bn-block-outer {
          background-color: transparent !important;
        }
        .block-note-full-height .bn-block-content {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
});

export default NoteEditor;
