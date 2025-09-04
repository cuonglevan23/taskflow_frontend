"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCallback, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { DARK_THEME } from "@/constants/theme";
import { NoteEditorProps } from "@/types/note";

// Add interface for editor commands
export interface NoteEditorHandle extends BlockNoteEditor {
  executeCommand: (command: string, value?: string) => void;
}

const NoteEditor = forwardRef<NoteEditorHandle, NoteEditorProps>(({
  initialContent,
  onContentChange,
  onSave,
  readOnly = false,
  className = "",
  placeholder = "Start writing your note..."
}, ref) => {

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Parse initial content from JSON string or Block array
  const parsedInitialContent = useCallback((): PartialBlock[] => {
    if (!initialContent) {
      // Return default content with one paragraph block
      return [{
        type: "paragraph",
        content: []
      }];
    }

    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate that each block has required properties
        const validBlocks = parsed.filter(block =>
          block && typeof block === 'object' && block.type
        );

        if (validBlocks.length > 0) {
          return validBlocks;
        }
      }

      // If parsed is empty array or not valid, return default
      return [{
        type: "paragraph",
        content: initialContent ? [{ type: "text", text: initialContent, styles: {} }] : []
      }];
    } catch (error) {
      console.warn('Failed to parse initial content as JSON, treating as plain text');
      return [{
        type: "paragraph",
        content: initialContent ? [{ type: "text", text: initialContent, styles: {} }] : []
      }];
    }
  }, [initialContent]);

  // Ensure we always have valid initial content
  const validInitialContent = parsedInitialContent();

  const editor = useCreateBlockNote({
    initialContent: validInitialContent.length > 0 ? validInitialContent : [{
      type: "paragraph",
      content: []
    }],
  });

  // Add executeCommand function to handle formatting
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editor) {
      console.warn('Editor not ready for command:', command);
      return;
    }

    try {
      console.log('Executing command in NoteEditor:', command, value);

      switch (command) {
        case 'bold':
          editor.toggleStyles({ bold: true });
          break;
        case 'italic':
          editor.toggleStyles({ italic: true });
          break;
        case 'underline':
          editor.toggleStyles({ underline: true });
          break;
        case 'strikethrough':
          editor.toggleStyles({ strike: true });
          break;
        case 'code':
          editor.toggleStyles({ code: true });
          break;
        case 'heading':
          if (value) {
            const level = parseInt(value);
            const currentBlock = editor.getTextCursorPosition().block;
            editor.updateBlock(currentBlock, {
              type: currentBlock.type === 'heading' && currentBlock.props?.level === level ? 'paragraph' : 'heading',
              props: currentBlock.type === 'heading' && currentBlock.props?.level === level ? {} : { level: level }
            });
          }
          break;
        case 'bulletList':
          const currentBlockBullet = editor.getTextCursorPosition().block;
          editor.updateBlock(currentBlockBullet, {
            type: currentBlockBullet.type === 'bulletListItem' ? 'paragraph' : 'bulletListItem'
          });
          break;
        case 'orderedList':
          const currentBlockNumber = editor.getTextCursorPosition().block;
          editor.updateBlock(currentBlockNumber, {
            type: currentBlockNumber.type === 'numberedListItem' ? 'paragraph' : 'numberedListItem'
          });
          break;
        case 'textAlign':
          if (value) {
            const currentBlockAlign = editor.getTextCursorPosition().block;
            editor.updateBlock(currentBlockAlign, {
              type: currentBlockAlign.type,
              props: { ...currentBlockAlign.props, textAlignment: value }
            });
          }
          break;
        case 'link':
          const url = prompt('Enter URL:');
          if (url) {
            editor.createLink(url);
          }
          break;
        case 'image':
          const imageUrl = prompt('Enter image URL:');
          if (imageUrl) {
            const currentBlock = editor.getTextCursorPosition().block;
            editor.insertBlocks([{
              type: 'image',
              props: { url: imageUrl }
            }], currentBlock, 'after');
          }
          break;
        default:
          console.warn(`Command ${command} not implemented`);
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  }, [editor]);

  // Expose both editor and executeCommand via ref
  useImperativeHandle(ref, () => ({
    ...editor,
    executeCommand
  }), [editor, executeCommand]);

  const handleContentChange = useCallback(() => {
    if (!editor) return;

    const blocks = editor.document;
    const content = JSON.stringify(blocks);
    onContentChange?.(content);
  }, [editor, onContentChange]);

  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;

    try {
      setIsSaving(true);
      const blocks = editor.document;
      const content = JSON.stringify(blocks);
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave]);

  // Setup editor event listeners
  useEffect(() => {
    if (!editor) return;

    // Listen for content changes
    editor.onChange(handleContentChange);

    // Expose editor instance globally for formatting toolbar
    if (typeof window !== 'undefined') {
      (window as any).blockNoteEditor = editor;
    }

    return () => {
      // Clean up global reference
      if (typeof window !== 'undefined') {
        delete (window as any).blockNoteEditor;
      }
    };
  }, [editor, handleContentChange]);

  // Auto-save keyboard shortcut (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!editor) {
    return (
      <div
        className={`flex items-center justify-center p-8 ${className}`}
        style={{ color: DARK_THEME.text.muted }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div className={`note-editor-container ${className}`}>
      <div
        className="blocknote-editor-wrapper"
        style={{
          backgroundColor: DARK_THEME.background.primary,
          color: DARK_THEME.text.primary,
          minHeight: '400px',


        }}
      >
        <BlockNoteView
          editor={editor}
          editable={!readOnly}
          theme="dark"
          data-theming-css-variables-demo
        />
      </div>

      {/* Status bar */}
      {!readOnly && (
        <div
          className="flex items-center justify-between mt-2 px-2 py-1 text-xs"
          style={{ color: DARK_THEME.text.muted }}
        >
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                Saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span>
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

        </div>
      )}
    </div>
  );
});

NoteEditor.displayName = 'NoteEditor';

export default NoteEditor;
