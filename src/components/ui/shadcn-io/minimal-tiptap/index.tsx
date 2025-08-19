'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { DARK_THEME } from '@/constants/theme';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalTiptapProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

function MinimalTiptap({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className,
}: MinimalTiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[200px] p-4 border-0'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div 
      className={cn('rounded-lg overflow-hidden border', className)}
      style={{
        backgroundColor: DARK_THEME.background.weakHover,
        borderColor: DARK_THEME.border.color
      }}
    >
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className="[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-white"
        style={{
          '[&_.ProseMirror]': {
            backgroundColor: DARK_THEME.background.weakHover
          }
        }}
      />
      
      <div 
        className="border-t p-2 flex flex-wrap items-center gap-1"
        style={{
          borderColor: DARK_THEME.border.color,
          backgroundColor: DARK_THEME.background.sidebar
        }}
      >
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white data-[state=on]:text-white"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
          onMouseLeave={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator 
          orientation="vertical" 
          className="h-6"
          style={{ backgroundColor: DARK_THEME.border.color }}
        />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <List className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600 data-[state=on]:bg-gray-600 data-[state=on]:text-white"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator 
          orientation="vertical" 
          className="h-6"
          style={{ backgroundColor: DARK_THEME.border.color }}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator 
          orientation="vertical" 
          className="h-6"
          style={{ backgroundColor: DARK_THEME.border.color }}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white disabled:opacity-30"
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover)}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0 text-gray-300 hover:text-white disabled:opacity-30"
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover)}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { MinimalTiptap, type MinimalTiptapProps };