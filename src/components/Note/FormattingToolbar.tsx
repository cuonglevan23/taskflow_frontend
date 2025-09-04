"use client";

import { useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string) => void;
  activeFormats?: Set<string>;
}

export default function FormattingToolbar({ onFormat, activeFormats = new Set() }: FormattingToolbarProps) {
  // Add local state to test active formats
  const [localActiveFormats, setLocalActiveFormats] = useState<Set<string>>(new Set());

  const handleCommand = useCallback((command: string, value?: string) => {
    // Update local state for testing
    setLocalActiveFormats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(command)) {
        newSet.delete(command);
      } else {
        newSet.add(command);
      }
      return newSet;
    });

    // Call the original onFormat function
    onFormat(command, value);
  }, [onFormat]);

  const isActive = (format: string) => {
    // Use local state first, fallback to activeFormats prop
    return localActiveFormats.has(format) || activeFormats.has(format);
  };

  // Use theme colors for button states
  const getButtonStyle = (format: string) => {
    const isFormatActive = isActive(format);
    const formatting = DARK_THEME.button.formatting;

    return {
      color: isFormatActive ? formatting.iconSelected : formatting.icon,
      backgroundColor: isFormatActive ? formatting.backgroundSelected : formatting.background,
      border: `1px solid ${isFormatActive ? formatting.borderSelected : 'transparent'}`,
      outline: 'none',
      boxShadow: 'none'
    };
  };

  const getButtonClassName = (format: string) => {
    return `p-1.5 rounded transition-all duration-200`;
  };

  return (
    <div className="flex items-center space-x-1">
      <style jsx>{`
        .formatting-button {
          transition: all 0.2s ease;
        }
        
        .formatting-button:hover {
          color: ${DARK_THEME.button.formatting.textHover} !important;
          background-color: ${DARK_THEME.button.formatting.backgroundHover} !important;
          border-color: ${DARK_THEME.button.formatting.borderHover} !important;
        }
        
        .formatting-button.active {
          background-color: ${DARK_THEME.button.formatting.backgroundSelected} !important;
          border-color: ${DARK_THEME.button.formatting.borderSelected} !important;
          color: ${DARK_THEME.button.formatting.iconSelected} !important;
        }
        
        .formatting-button.active:hover {
          background-color: ${DARK_THEME.button.formatting.backgroundSelectedHover} !important;
          border-color: ${DARK_THEME.button.formatting.borderActive} !important;
          color: ${DARK_THEME.button.formatting.iconSelected} !important;
        }
        
        .formatting-button.active:active {
          background-color: ${DARK_THEME.button.formatting.backgroundSelectedActive} !important;
        }
      `}</style>

      {/* Text Formatting */}
      <button
        onClick={() => handleCommand('bold')}
        className={`formatting-button ${getButtonClassName('bold')} ${isActive('bold') ? 'active' : ''}`}
        style={getButtonStyle('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('italic')}
        className={`formatting-button ${getButtonClassName('italic')} ${isActive('italic') ? 'active' : ''}`}
        style={getButtonStyle('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('underline')}
        className={`formatting-button ${getButtonClassName('underline')} ${isActive('underline') ? 'active' : ''}`}
        style={getButtonStyle('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('strikethrough')}
        className={`formatting-button ${getButtonClassName('strikethrough')} ${isActive('strikethrough') ? 'active' : ''}`}
        style={getButtonStyle('strikethrough')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('code')}
        className={`formatting-button ${getButtonClassName('code')} ${isActive('code') ? 'active' : ''}`}
        style={getButtonStyle('code')}
        title="Code"
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: DARK_THEME.border.default }} />

      {/* Headings */}
      <button
        onClick={() => handleCommand('heading', '1')}
        className={`formatting-button ${getButtonClassName('heading1')} ${isActive('heading1') ? 'active' : ''}`}
        style={getButtonStyle('heading1')}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('heading', '2')}
        className={`formatting-button ${getButtonClassName('heading2')} ${isActive('heading2') ? 'active' : ''}`}
        style={getButtonStyle('heading2')}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('heading', '3')}
        className={`formatting-button ${getButtonClassName('heading3')} ${isActive('heading3') ? 'active' : ''}`}
        style={getButtonStyle('heading3')}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: DARK_THEME.border.default }} />

      {/* Lists */}
      <button
        onClick={() => handleCommand('bulletList')}
        className={`formatting-button ${getButtonClassName('bulletList')} ${isActive('bulletList') ? 'active' : ''}`}
        style={getButtonStyle('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('orderedList')}
        className={`formatting-button ${getButtonClassName('orderedList')} ${isActive('orderedList') ? 'active' : ''}`}
        style={getButtonStyle('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('blockquote')}
        className={`formatting-button ${getButtonClassName('blockquote')} ${isActive('blockquote') ? 'active' : ''}`}
        style={getButtonStyle('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: DARK_THEME.border.default }} />

      {/* Alignment */}
      <button
        onClick={() => handleCommand('textAlign', 'left')}
        className={`formatting-button ${getButtonClassName('alignLeft')} ${isActive('alignLeft') ? 'active' : ''}`}
        style={getButtonStyle('alignLeft')}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('textAlign', 'center')}
        className={`formatting-button ${getButtonClassName('alignCenter')} ${isActive('alignCenter') ? 'active' : ''}`}
        style={getButtonStyle('alignCenter')}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('textAlign', 'right')}
        className={`formatting-button ${getButtonClassName('alignRight')} ${isActive('alignRight') ? 'active' : ''}`}
        style={getButtonStyle('alignRight')}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: DARK_THEME.border.default }} />

      {/* Links and Media */}
      <button
        onClick={() => handleCommand('link')}
        className={`formatting-button ${getButtonClassName('link')} ${isActive('link') ? 'active' : ''}`}
        style={getButtonStyle('link')}
        title="Add Link (Ctrl+K)"
      >
        <Link className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('image')}
        className={`formatting-button ${getButtonClassName('image')} ${isActive('image') ? 'active' : ''}`}
        style={getButtonStyle('image')}
        title="Add Image"
      >
        <Image className="h-4 w-4" />
      </button>
    </div>
  );
}
