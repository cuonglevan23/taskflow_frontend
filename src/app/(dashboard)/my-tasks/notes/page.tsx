"use client";

import React, { useState, useEffect, useRef } from "react";
import { NoteEditor } from "@/components/Note";
import { Block } from "@blocknote/core";
import { BlockNoteEditor } from "@blocknote/core";
import {
  Menu, 
  FileText,
  Plus,
  Minus,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  Link,
  Code,
  RotateCcw,
  Star
} from "lucide-react";
import { Button } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";

export default function MyTaskNotesPage() {
  const [content, setContent] = useState<Block[]>([]);
  const [isNarrowView, setIsNarrowView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [outline, setOutline] = useState<{ id: string; title: string; level: number }[]>([]);
  const [currentBlockType, setCurrentBlockType] = useState("paragraph");
  const [showBlockTypeDropdown, setShowBlockTypeDropdown] = useState(false);
  const editorRef = useRef<BlockNoteEditor | null>(null);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("my-scratchpad");
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent(parsed);
      } catch (error) {
        console.error("Failed to load scratchpad:", error);
      }
    }
  }, []);

  // Save content to localStorage
  const handleSave = (newContent: Block[]) => {
    localStorage.setItem("my-scratchpad", JSON.stringify(newContent));
    setContent(newContent);
  };

  // Extract outline from content
  useEffect(() => {
    if (content && content.length > 0) {
      const headings = content
        .filter((block) => block.type === "heading")
        .map((block, index) => {
          let title = "Untitled";
          if (block.content && Array.isArray(block.content) && block.content.length > 0) {
            const firstContent = block.content[0];
            if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
              title = (firstContent as { text: string }).text;
            }
          }

          return {
            id: block.id || `heading-${index}`,
            title,
            level: (block.props && 'level' in block.props) ? (block.props.level as number) : 1,
          };
        });
      setOutline(headings);
    } else {
      setOutline([]);
    }
  }, [content]);

  const scrollToHeading = (headingId: string) => {
    const element = document.querySelector(`[data-id="${headingId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Toolbar functions with proper error handling
  const insertBlock = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.insertBlocks([{
          type: "paragraph",
          content: []
        }], editorRef.current.getTextCursorPosition().block, "after");
      } catch (error) {
        console.error("Error inserting block:", error);
      }
    }
  };

  const removeBlock = () => {
    if (editorRef.current) {
      try {
        const selection = editorRef.current.getSelection();
        if (selection && selection.blocks.length > 0) {
          editorRef.current.removeBlocks([selection.blocks[0]]);
        }
      } catch (error) {
        console.error("Error removing block:", error);
      }
    }
  };

  const toggleBold = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.toggleStyles({ bold: true });
      } catch (error) {
        console.error("Error toggling bold:", error);
      }
    }
  };

  const toggleItalic = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.toggleStyles({ italic: true });
      } catch (error) {
        console.error("Error toggling italic:", error);
      }
    }
  };

  const toggleUnderline = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.toggleStyles({ underline: true });
      } catch (error) {
        console.error("Error toggling underline:", error);
      }
    }
  };

  const toggleStrikethrough = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.toggleStyles({ strike: true });
      } catch (error) {
        console.error("Error toggling strikethrough:", error);
      }
    }
  };

  const insertBulletList = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        const currentBlock = editorRef.current.getTextCursorPosition().block;
        editorRef.current.replaceBlocks([currentBlock], [{
          type: "bulletListItem",
          content: currentBlock.content || []
        }]);
        setCurrentBlockType("bulletListItem");
      } catch (error) {
        console.error("Error inserting bullet list:", error);
      }
    }
  };

  const insertNumberedList = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        const currentBlock = editorRef.current.getTextCursorPosition().block;
        editorRef.current.replaceBlocks([currentBlock], [{
          type: "numberedListItem",
          content: currentBlock.content || []
        }]);
        setCurrentBlockType("numberedListItem");
      } catch (error) {
        console.error("Error inserting numbered list:", error);
      }
    }
  };

  const insertCodeBlock = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        const currentBlock = editorRef.current.getTextCursorPosition().block;
        editorRef.current.replaceBlocks([currentBlock], [{
          type: "codeBlock",
          content: currentBlock.content || []
        }]);
        setCurrentBlockType("codeBlock");
      } catch (error) {
        console.error("Error inserting code block:", error);
      }
    }
  };

  const undo = () => {
    if (editorRef.current) {
      try {
        editorRef.current.undo();
      } catch (error) {
        console.error("Error undoing:", error);
      }
    }
  };

  const changeBlockType = (type: string) => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        const currentBlock = editorRef.current.getTextCursorPosition().block;
        editorRef.current.replaceBlocks([currentBlock], [{
          type: type as any,
          content: currentBlock.content || []
        }]);
        setCurrentBlockType(type);
        setShowBlockTypeDropdown(false);
      } catch (error) {
        console.error("Error changing block type:", error);
        setShowBlockTypeDropdown(false);
      }
    }
  };

  const getBlockTypeLabel = (type: string) => {
    const types = {
      'paragraph': 'Paragraph',
      'heading': 'Heading 1',
      'heading2': 'Heading 2',
      'heading3': 'Heading 3',
      'bulletListItem': 'Bullet List',
      'numberedListItem': 'Numbered List',
      'codeBlock': 'Code Block',
      'quote': 'Quote'
    };
    return types[type as keyof typeof types] || 'Paragraph';
  };

  const insertLink = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          editorRef.current.insertInlineContent([{
            type: "link",
            href: url,
            content: "Link"
          }]);
        }
      } catch (error) {
        console.error("Error inserting link:", error);
      }
    }
  };

  const toggleFavorite = () => {
    alert('Add to favorites functionality will be implemented');
  };

  // Enhanced button component with consistent styling
  const ToolbarButton = ({
    onClick,
    title,
    children,
    className = "",
    isActive = false
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className={`p-1.5 rounded transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        color: DARK_THEME.header.text,
        backgroundColor: isActive ? DARK_THEME.sidebar.hover : 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isActive ? DARK_THEME.sidebar.hover : 'transparent';
      }}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div 
      className="w-full flex flex-col" 
      style={{ 
        backgroundColor: DARK_THEME.background.primary,
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Rich Toolbar Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ 
          backgroundColor: DARK_THEME.header.background,
          borderColor: DARK_THEME.header.border,
          height: '52px'
        }}
      >
        {/* Left - Toolbar với đầy đủ chức năng */}
        <div className="flex items-center gap-1">
          {/* Add/Remove buttons */}
          <ToolbarButton onClick={insertBlock} title="Add New Block">
            <Plus className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={removeBlock} title="Remove Current Block">
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          {/* Separator */}
          <div className="w-px h-6 mx-2" style={{ backgroundColor: DARK_THEME.border.muted }}></div>

          {/* Text Style Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-1.5 rounded transition-all duration-200 hover:scale-105 flex items-center gap-1"
              style={{
                color: DARK_THEME.header.text,
                backgroundColor: showBlockTypeDropdown ? DARK_THEME.sidebar.hover : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = showBlockTypeDropdown ? DARK_THEME.sidebar.hover : 'transparent';
              }}
              onClick={() => setShowBlockTypeDropdown(!showBlockTypeDropdown)}
              title="Change Block Type"
            >
              <span className="text-sm">{getBlockTypeLabel(currentBlockType)}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {showBlockTypeDropdown && (
              <div
                className="absolute z-10 mt-1 w-48 rounded-md shadow-lg ring-1 ring-opacity-5"
                style={{
                  backgroundColor: DARK_THEME.dropdown.background,
                  borderColor: DARK_THEME.dropdown.border,
                  boxShadow: DARK_THEME.dropdown.shadow
                }}
              >
                <div className="py-1" role="none">
                  {['paragraph', 'heading', 'heading2', 'heading3', 'bulletListItem', 'numberedListItem', 'codeBlock', 'quote'].map((type) => (
                    <button
                      key={type}
                      onClick={() => changeBlockType(type)}
                      className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors"
                      style={{ color: DARK_THEME.text.primary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = DARK_THEME.dropdown.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {getBlockTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 mx-2" style={{ backgroundColor: DARK_THEME.border.muted }}></div>

          {/* Formatting buttons */}
          <ToolbarButton onClick={toggleBold} title="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleItalic} title="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleUnderline} title="Underline">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleStrikethrough} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          {/* Separator */}
          <div className="w-px h-6 mx-2" style={{ backgroundColor: DARK_THEME.border.muted }}></div>

          {/* List buttons */}
          <ToolbarButton onClick={insertBulletList} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertNumberedList} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => console.log('Align functionality')} title="Text Alignment">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>

          {/* Separator */}
          <div className="w-px h-6 mx-2" style={{ backgroundColor: DARK_THEME.border.muted }}></div>

          {/* More tools */}
          <ToolbarButton onClick={insertLink} title="Insert Link">
            <Link className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertCodeBlock} title="Code Block">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={undo} title="Undo">
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleFavorite} title="Add to Favorites">
            <Star className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Right - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>
              Narrow view
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNarrowView(!isNarrowView)}
              className="p-1 rounded text-sm transition-all duration-200 hover:scale-105"
              style={{
                color: DARK_THEME.text.muted,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isNarrowView ? '▼' : '▶'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: DARK_THEME.button.success.text }}>
              Saved
            </span>
            <span className="text-sm" style={{ color: DARK_THEME.text.muted }}>
              • 7 minutes ago
            </span>
          </div>
        </div>
      </div>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - với nút đóng bên trong */}
        {isSidebarOpen && (
          <div
            className="w-64 border-r flex-shrink-0 flex flex-col"
            style={{
              backgroundColor: DARK_THEME.background.primary,
              borderColor: DARK_THEME.background.primary,
              height: 'calc(100vh - 52px)'
            }}
          >
            {/* Sidebar header với nút đóng */}
            <div className="flex items-center justify-between p-4 ">

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-md transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: DARK_THEME.sidebar.textMuted,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Close sidebar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {outline.length > 0 ? (
                <div className="space-y-1">
                  {outline.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className="w-full text-left p-2 rounded transition-all duration-200"
                      style={{
                        paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0px)';
                      }}
                    >
                      <span className="text-sm" style={{ color: DARK_THEME.sidebar.text }}>
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
              <></>
              )}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative" style={{ minHeight: 0, height: '100%' }}>
          {/* Nút mở sidebar - chỉ hiện khi sidebar đóng */}
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-10 p-1.5 rounded-md transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: 'rgba(46, 46, 48, 0.8)',
                color: DARK_THEME.text.muted,
                border: `1px solid ${DARK_THEME.border.default}`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                e.currentTarget.style.color = DARK_THEME.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(46, 46, 48, 0.8)';
                e.currentTarget.style.color = DARK_THEME.text.muted;
              }}
              title="Open sidebar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}

          <div
            className="flex-1 h-full"
            style={{
              maxWidth: isNarrowView ? '800px' : '100%',
              margin: isNarrowView ? '0 auto' : '0',
              width: '100%',
              height: 'calc(100vh - 52px)',
              padding: '0px 0px 0px 30px',
            }}
          >
            <NoteEditor
              initialContent={content}
              onSave={handleSave}
              className="h-full w-full"
              ref={editorRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
