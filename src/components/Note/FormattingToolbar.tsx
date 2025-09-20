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
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string) => void;
  activeFormats?: Set<string>;
}

export default function FormattingToolbar({ onFormat, activeFormats = new Set() }: FormattingToolbarProps) {
  // Add local state to test active formats
  const [localActiveFormats, setLocalActiveFormats] = useState<Set<string>>(new Set());

  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

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
    const formatting = theme.button?.formatting || {};

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
          color: ${theme.button?.formatting?.textHover} !important;
          background-color: ${theme.button?.formatting?.backgroundHover} !important;
          border-color: ${theme.button?.formatting?.borderHover} !important;
        }
        
        .formatting-button.active {
          background-color: ${theme.button?.formatting?.backgroundSelected} !important;
          border-color: ${theme.button?.formatting?.borderSelected} !important;
          color: ${theme.button?.formatting?.iconSelected} !important;
        }
        
        .formatting-button.active:hover {
          background-color: ${theme.button?.formatting?.backgroundSelectedHover} !important;
          border-color: ${theme.button?.formatting?.borderActive} !important;
          color: ${theme.button?.formatting?.iconSelected} !important;
        }
        
        .formatting-button.active:active {
          background-color: ${theme.button?.formatting?.backgroundSelectedActive} !important;
        }
      `}</style>

      {/* Text Formatting */}
      <button
        onClick={() => handleCommand('bold')}
        className={`formatting-button ${getButtonClassName('bold')} ${isActive('bold') ? 'active' : ''}`}
        style={getButtonStyle('bold')}
        title={t('formattingToolbar.bold')}
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('italic')}
        className={`formatting-button ${getButtonClassName('italic')} ${isActive('italic') ? 'active' : ''}`}
        style={getButtonStyle('italic')}
        title={t('formattingToolbar.italic')}
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('underline')}
        className={`formatting-button ${getButtonClassName('underline')} ${isActive('underline') ? 'active' : ''}`}
        style={getButtonStyle('underline')}
        title={t('formattingToolbar.underline')}
      >
        <Underline className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('strikethrough')}
        className={`formatting-button ${getButtonClassName('strikethrough')} ${isActive('strikethrough') ? 'active' : ''}`}
        style={getButtonStyle('strikethrough')}
        title={t('formattingToolbar.strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('code')}
        className={`formatting-button ${getButtonClassName('code')} ${isActive('code') ? 'active' : ''}`}
        style={getButtonStyle('code')}
        title={t('formattingToolbar.code')}
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: theme.border?.default }} />

      {/* Headings */}
      <button
        onClick={() => handleCommand('heading', '1')}
        className={`formatting-button ${getButtonClassName('heading1')} ${isActive('heading1') ? 'active' : ''}`}
        style={getButtonStyle('heading1')}
        title={t('formattingToolbar.heading1')}
      >
        <Heading1 className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('heading', '2')}
        className={`formatting-button ${getButtonClassName('heading2')} ${isActive('heading2') ? 'active' : ''}`}
        style={getButtonStyle('heading2')}
        title={t('formattingToolbar.heading2')}
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('heading', '3')}
        className={`formatting-button ${getButtonClassName('heading3')} ${isActive('heading3') ? 'active' : ''}`}
        style={getButtonStyle('heading3')}
        title={t('formattingToolbar.heading3')}
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: theme.border?.default }} />

      {/* Lists */}
      <button
        onClick={() => handleCommand('bulletList')}
        className={`formatting-button ${getButtonClassName('bulletList')} ${isActive('bulletList') ? 'active' : ''}`}
        style={getButtonStyle('bulletList')}
        title={t('formattingToolbar.bulletList')}
      >
        <List className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('orderedList')}
        className={`formatting-button ${getButtonClassName('orderedList')} ${isActive('orderedList') ? 'active' : ''}`}
        style={getButtonStyle('orderedList')}
        title={t('formattingToolbar.numberedList')}
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('blockquote')}
        className={`formatting-button ${getButtonClassName('blockquote')} ${isActive('blockquote') ? 'active' : ''}`}
        style={getButtonStyle('blockquote')}
        title={t('formattingToolbar.quote')}
      >
        <Quote className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: theme.border?.default }} />

      {/* Alignment */}
      <button
        onClick={() => handleCommand('textAlign', 'left')}
        className={`formatting-button ${getButtonClassName('alignLeft')} ${isActive('alignLeft') ? 'active' : ''}`}
        style={getButtonStyle('alignLeft')}
        title={t('formattingToolbar.alignLeft')}
      >
        <AlignLeft className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('textAlign', 'center')}
        className={`formatting-button ${getButtonClassName('alignCenter')} ${isActive('alignCenter') ? 'active' : ''}`}
        style={getButtonStyle('alignCenter')}
        title={t('formattingToolbar.alignCenter')}
      >
        <AlignCenter className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('textAlign', 'right')}
        className={`formatting-button ${getButtonClassName('alignRight')} ${isActive('alignRight') ? 'active' : ''}`}
        style={getButtonStyle('alignRight')}
        title={t('formattingToolbar.alignRight')}
      >
        <AlignRight className="h-4 w-4" />
      </button>

      <div className="w-px h-5 mx-2" style={{ backgroundColor: theme.border?.default }} />

      {/* Links and Media */}
      <button
        onClick={() => handleCommand('link')}
        className={`formatting-button ${getButtonClassName('link')} ${isActive('link') ? 'active' : ''}`}
        style={getButtonStyle('link')}
        title={t('formattingToolbar.addLink')}
      >
        <Link className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleCommand('image')}
        className={`formatting-button ${getButtonClassName('image')} ${isActive('image') ? 'active' : ''}`}
        style={getButtonStyle('image')}
        title={t('formattingToolbar.addImage')}
      >
        <Image className="h-4 w-4" />
      </button>
    </div>
  );
}
