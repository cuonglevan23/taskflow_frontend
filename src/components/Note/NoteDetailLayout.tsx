"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { DARK_THEME } from '@/constants/theme';
import NoteEditor from './NoteEditor';
import { NoteResponse, UpdateNoteRequest } from '@/types/note';
import TableOfContents from './TableOfContents';
import NoteEditorLayout from './NoteEditorLayout';
import FormattingToolbar from './FormattingToolbar';
import SaveStatus from './SaveStatus';
import TemplateSelector from './TemplateSelector';

interface NoteDetailLayoutProps {
  note: NoteResponse;
  onUpdateNote: (id: number, data: UpdateNoteRequest) => Promise<void>;
  onBack?: () => void;
}

export default function NoteDetailLayout(props: NoteDetailLayoutProps) {
  const { note, onUpdateNote, onBack } = props;
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplates, setShowTemplates] = useState(!note.title && !note.content);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  // Create ref for NoteEditor
  const editorRef = useRef<any>(null);

  // Replace useEditorFormatting hook with direct editor command execution
  const executeCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current?.executeCommand) {
      editorRef.current.executeCommand(command, value);
    } else {
      console.warn('Editor ref not available for command:', command);
    }
  }, []);

  const activeFormats = new Set<string>(); // We'll implement this later if needed

  // Auto-save when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await onUpdateNote(note.id, {
        title: title || 'Untitled',
        content
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [note.id, title, content, onUpdateNote]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (showTemplates && newContent) {
      setShowTemplates(false);
    }
  }, [showTemplates]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (showTemplates && e.target.value) {
      setShowTemplates(false);
    }
  }, [showTemplates]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const editorElement = document.querySelector('.bn-editor .ProseMirror');
      if (editorElement) {
        (editorElement as HTMLElement).focus();
      }
    }
  }, []);

  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }, [lastSaved]);

  const templateSuggestions = [
    { icon: '📝', label: 'My scratchpad' },
    { icon: '📅', label: 'Weekly planning' },
    { icon: '📋', label: 'My meeting notes' },
    { icon: '🔗', label: 'Quick links' },
    { icon: '📄', label: 'Blank note' }
  ];

  const handleTemplateSelect = useCallback((template: typeof templateSuggestions[0]) => {
    let templateContent = '';

    switch (template.label) {
      case 'My scratchpad':
        templateContent = JSON.stringify([
          { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "📝 My Scratchpad", styles: {} }] },
          { type: "paragraph", content: [{ type: "text", text: "Quick thoughts and ideas go here...", styles: {} }] }
        ]);
        break;
      case 'Weekly planning':
        templateContent = JSON.stringify([
          { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "📅 Weekly Planning", styles: {} }] },
          { type: "heading", props: { level: 3 }, content: [{ type: "text", text: "Goals", styles: {} }] },
          { type: "bulletListItem", content: [{ type: "text", text: "Goal 1", styles: {} }] },
          { type: "heading", props: { level: 3 }, content: [{ type: "text", text: "Tasks", styles: {} }] },
          { type: "bulletListItem", content: [{ type: "text", text: "Task 1", styles: {} }] }
        ]);
        break;
      case 'My meeting notes':
        templateContent = JSON.stringify([
          { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "📋 Meeting Notes", styles: {} }] },
          { type: "heading", props: { level: 3 }, content: [{ type: "text", text: "👥 Attendees", styles: {} }] },
          { type: "bulletListItem", content: [{ type: "text", text: "Who did I meet with?", styles: {} }] },
          { type: "heading", props: { level: 3 }, content: [{ type: "text", text: "📝 Notes", styles: {} }] },
          { type: "bulletListItem", content: [{ type: "text", text: "Add notes here", styles: {} }] },
          { type: "heading", props: { level: 3 }, content: [{ type: "text", text: "🎯 Action items", styles: {} }] },
          { type: "bulletListItem", content: [{ type: "text", text: "What do I need to get done?", styles: {} }] }
        ]);
        break;
      default:
        templateContent = JSON.stringify([
          { type: "paragraph", content: [] }
        ]);
    }

    setContent(templateContent);
    setTitle(template.label);
    setShowTemplates(false);
  }, []);

  const toggleTableOfContents = useCallback(() => {
    setShowTableOfContents(prev => !prev);
  }, []);

  return (
    <div className="h-full w-full" style={{ backgroundColor: DARK_THEME.background.primary }}>
      <NoteEditorLayout
        showSidebar={showTableOfContents}
        sidebar={<TableOfContents content={content} />}
        onToggleSidebar={toggleTableOfContents}
        header={
          /* Top Toolbar - giống Notion */
          <div className="w-full border-b border-opacity-20" style={{ borderColor: DARK_THEME.border.default }}>
            <div className="flex items-center justify-between px-6 py-2">
              {/* Left: Navigation + Formatting tools */}
              <div className="flex items-center space-x-1">
                {onBack && (
                  <>
                    <button
                      onClick={onBack}
                      className="p-2 rounded transition-colors"
                      style={{ color: DARK_THEME.text.muted, backgroundColor: 'transparent', border: 'none' }}
                      title="Back"
                    >
                      ←
                    </button>
                    <div className="w-px h-5 mx-2" style={{ backgroundColor: DARK_THEME.border.default }} />
                  </>
                )}

                {/* Replace all formatting buttons with FormattingToolbar component */}
                <FormattingToolbar
                  onFormat={executeCommand}
                  activeFormats={activeFormats}
                />
              </div>

              {/* Right: Save status */}
              <div className="flex items-center space-x-3">
                <SaveStatus
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  formatLastSaved={formatLastSaved}
                />
              </div>
            </div>
          </div>
        }
      >
        {/* Main content area - now only contains the content without header */}
        <div className="max-w-4xl mx-auto px-12 py-16 relative">
          {/* Title area */}
          <div className="mb-8">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Add a title"
              className="w-full border-none outline-none bg-transparent text-5xl font-bold leading-tight placeholder-opacity-50"
              style={{
                color: DARK_THEME.text.primary,
                fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}
            />
          </div>




          {/* Note Editor */}
          <div className="w-full notion-editor-container">
            <style jsx global>{`
              /* Remove all card-like styling and make editor seamless */
              .notion-editor-container .bn-container {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                border-radius: 0 !important;
              }
              
              .notion-editor-container .bn-editor {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                min-height: 70vh !important;
                border-radius: 0 !important;
              }
              
              /* Make text flow naturally like a document */
              .notion-editor-container .ProseMirror {
                padding: 0 !important;
                margin: 0 !important;
                outline: none !important;
                border: none !important;
                background: transparent !important;
                font-size: 16px !important;
                line-height: 1.7 !important;
                color: ${DARK_THEME.text.primary} !important;
                font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                max-width: none !important;
                width: 100% !important;
              }
              
              /* Natural paragraph spacing */
              .notion-editor-container .ProseMirror p {
                margin: 8px 0 !important;
                line-height: 1.7 !important;
                font-size: 16px !important;
                color: ${DARK_THEME.text.primary} !important;
              }
              
              /* Clean heading styles that work well with outline */
              .notion-editor-container .ProseMirror h1 {
                font-size: 2.25em !important;
                font-weight: 700 !important;
                margin: 32px 0 16px 0 !important;
                line-height: 1.2 !important;
                color: ${DARK_THEME.text.primary} !important;
                letter-spacing: -0.025em !important;
              }
              
              .notion-editor-container .ProseMirror h2 {
                font-size: 1.75em !important;
                font-weight: 600 !important;
                margin: 28px 0 12px 0 !important;
                line-height: 1.3 !important;
                color: ${DARK_THEME.text.primary} !important;
                letter-spacing: -0.015em !important;
              }
              
              .notion-editor-container .ProseMirror h3 {
                font-size: 1.375em !important;
                font-weight: 600 !important;
                margin: 24px 0 8px 0 !important;
                line-height: 1.4 !important;
                color: ${DARK_THEME.text.primary} !important;
              }
              
              .notion-editor-container .ProseMirror h4 {
                font-size: 1.125em !important;
                font-weight: 600 !important;
                margin: 20px 0 6px 0 !important;
                line-height: 1.5 !important;
                color: ${DARK_THEME.text.primary} !important;
              }
              
              /* Better list styling */
              .notion-editor-container .ProseMirror ul, 
              .notion-editor-container .ProseMirror ol {
                margin: 8px 0 16px 0 !important;
                padding-left: 28px !important;
              }
              
              .notion-editor-container .ProseMirror li {
                margin: 4px 0 !important;
                line-height: 1.6 !important;
                color: ${DARK_THEME.text.primary} !important;
              }
              
              .notion-editor-container .ProseMirror li p {
                margin: 2px 0 !important;
              }
              
              /* Seamless placeholder */
              .notion-editor-container .ProseMirror p.is-empty:first-child::before {
                content: "Start writing your document..." !important;
                color: ${DARK_THEME.text.muted} !important;
                opacity: 0.5 !important;
                font-style: italic !important;
                pointer-events: none !important;
                font-size: 16px !important;
              }
              
              /* Hide default toolbar completely */
              .notion-editor-container .bn-toolbar {
                display: none !important;
              }
              
              /* Clean suggestion menu */
              .notion-editor-container .bn-suggestion-menu {
                background: ${DARK_THEME.background.secondary} !important;
                border: 1px solid ${DARK_THEME.border.default} !important;
                border-radius: 8px !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                padding: 8px !important;
              }
              
              .notion-editor-container .bn-suggestion-menu-item {
                color: ${DARK_THEME.text.primary} !important;
                padding: 8px 12px !important;
                border-radius: 4px !important;
                margin: 2px 0 !important;
              }
              
              .notion-editor-container .bn-suggestion-menu-item:hover,
              .notion-editor-container .bn-suggestion-menu-item[data-selected="true"] {
                background: ${DARK_THEME.background.weakHover} !important;
              }
              
              /* Remove any focus rings or borders */
              .notion-editor-container .ProseMirror:focus {
                outline: none !important;
                border: none !important;
                box-shadow: none !important;
              }
              
              /* Ensure text selection looks good */
              .notion-editor-container .ProseMirror ::selection {
                background: rgba(59, 130, 246, 0.2) !important;
              }
            `}</style>

            <NoteEditor
              ref={editorRef}
              initialContent={content}
              onContentChange={handleContentChange}
              onSave={handleSave}
              placeholder=""
              className=""
            />
          </div>
        </div>
      </NoteEditorLayout>
    </div>
  );
}
