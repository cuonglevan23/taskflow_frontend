"use client";

import { useCallback, useState, useEffect } from 'react';

export default function useEditorFormatting() {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Get editor instance from DOM
  useEffect(() => {
    const getEditorInstance = () => {
      // Try to get BlockNote editor instance from window or global scope
      if (typeof window !== 'undefined') {
        // Check if there's a global editor instance
        if ((window as any).blockNoteEditor) {
          return (window as any).blockNoteEditor;
        }

        // Try to get from DOM element
        const editorElement = document.querySelector('.bn-editor') || document.querySelector('[data-editor="true"]');
        if (editorElement) {
          // Check various ways the editor might be attached
          const editor = (editorElement as any)._blockNoteEditor ||
                        (editorElement as any).editor ||
                        (editorElement as any).__editor;
          if (editor) return editor;
        }

        // Try ProseMirror approach
        const proseMirrorElement = document.querySelector('.ProseMirror');
        if (proseMirrorElement && (proseMirrorElement as any).pmViewDesc) {
          return (proseMirrorElement as any).pmViewDesc.view;
        }
      }

      return null;
    };

    // Try multiple times with increasing delays
    const attempts = [100, 500, 1000, 2000];

    attempts.forEach((delay, index) => {
      setTimeout(() => {
        if (!editorInstance) {
          const editor = getEditorInstance();
          if (editor) {
            console.log('Editor found:', editor);
            setEditorInstance(editor);
          }
        }
      }, delay);
    });
  }, [editorInstance]);

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    console.log('Executing command:', command, value);

    // Get the current BlockNote editor
    const editor = (window as any).blockNoteEditor;

    if (!editor) {
      console.warn('No BlockNote editor instance found');
      return;
    }

    try {
      console.log('Using BlockNote editor for command:', command);

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
              type: 'heading',
              props: { level: level }
            });
          }
          break;
        case 'bulletList':
          const currentBlockBullet = editor.getTextCursorPosition().block;
          if (currentBlockBullet.type === 'bulletListItem') {
            // Convert back to paragraph
            editor.updateBlock(currentBlockBullet, {
              type: 'paragraph'
            });
          } else {
            // Convert to bullet list
            editor.updateBlock(currentBlockBullet, {
              type: 'bulletListItem'
            });
          }
          break;
        case 'orderedList':
          const currentBlockNumber = editor.getTextCursorPosition().block;
          if (currentBlockNumber.type === 'numberedListItem') {
            // Convert back to paragraph
            editor.updateBlock(currentBlockNumber, {
              type: 'paragraph'
            });
          } else {
            // Convert to numbered list
            editor.updateBlock(currentBlockNumber, {
              type: 'numberedListItem'
            });
          }
          break;
        case 'blockquote':
          const currentBlockQuote = editor.getTextCursorPosition().block;
          if (currentBlockQuote.type === 'paragraph') {
            editor.updateBlock(currentBlockQuote, {
              type: 'paragraph',
              props: { ...currentBlockQuote.props, backgroundColor: 'gray' }
            });
          }
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
          console.warn(`Command ${command} not implemented for BlockNote editor`);
      }
    } catch (error) {
      console.error(`Error executing command ${command} with BlockNote:`, error);
      console.log('Editor object:', editor);
    }
  }, []);

  return {
    executeCommand,
    activeFormats,
    isEditorReady: !!editorInstance
  };
}
