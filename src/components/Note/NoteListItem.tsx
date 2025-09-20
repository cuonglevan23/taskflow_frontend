"use client";

import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Paperclip,
  User,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { DARK_THEME } from '@/constants/theme';
import { NoteListItemProps } from '@/types/note';

const NoteListItem = ({
  note,
  onEdit,
  onDelete,
  onArchive,
  onToggleVisibility,
  showProjectInfo = false
}: NoteListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
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

  const handleEdit = useCallback(() => {
    onEdit(note);
  }, [note, onEdit]);

  const handleClick = useCallback(() => {
    // This will be handled by parent component to navigate to detail page
    onEdit(note);
  }, [note, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm(t('noteListItem.confirmDelete'))) {
      onDelete(note.id);
    }
  }, [note.id, onDelete, t]);

  const handleArchive = useCallback(() => {
    onArchive(note.id, !note.isArchived);
  }, [note.id, note.isArchived, onArchive]);

  const handleToggleVisibility = useCallback(() => {
    if (onToggleVisibility) {
      onToggleVisibility(note.id, !note.isPublic);
    }
  }, [note.id, note.isPublic, onToggleVisibility]);

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (!content) return '';

    try {
      // Try to parse as JSON and extract text content
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        const textContent = parsed
          .map(block => {
            if (block.content && Array.isArray(block.content)) {
              return block.content
                .filter((item: any) => item.type === 'text')
                .map((item: any) => item.text || '')
                .join('');
            }
            return '';
          })
          .join(' ')
          .trim();

        return textContent.length > maxLength
          ? textContent.substring(0, maxLength) + '...'
          : textContent;
      }
    } catch (error) {
      // If parsing fails, treat as plain text
      return content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;
    }

    return content;
  };

  const getPreviewContent = (): string => {
    const contentText = truncateContent(note.content || '');
    return contentText || t('noteListItem.noContent');
  };

  return (
    <div
      className="note-list-item rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default,
      }}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 flex-shrink-0" style={{ color: theme.text.muted }} />
              <h3
                className="font-medium truncate"
                style={{ color: theme.text.primary }}
              >
                {note.title || t('noteListItem.untitled')}
              </h3>

              {/* Visibility indicator */}
              <div className="flex items-center gap-1">
                {note.isPublic ? (
                  <Globe className="h-3 w-3" style={{ color: theme.status.info }} />
                ) : (
                  <Lock className="h-3 w-3" style={{ color: theme.text.muted }} />
                )}
              </div>

              {/* Archive indicator */}
              {note.isArchived && (
                <Archive className="h-3 w-3" style={{ color: theme.text.muted }} />
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs" style={{ color: theme.text.muted }}>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
              </div>

              {showProjectInfo && note.project && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{note.project.name}</span>
                </div>
              )}

              {note.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{note.author.firstName} {note.author.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="h-8 w-8 p-0"
              style={{ color: theme.text.muted }}
              title={t('noteListItem.actions.edit')}
            >
              <Edit3 className="h-3 w-3" />
            </Button>

            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility();
                }}
                className="h-8 w-8 p-0"
                style={{ color: theme.text.muted }}
                title={note.isPublic ? t('noteListItem.actions.makePrivate') : t('noteListItem.actions.makePublic')}
              >
                {note.isPublic ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleArchive();
              }}
              className="h-8 w-8 p-0"
              style={{ color: theme.text.muted }}
              title={note.isArchived ? t('noteListItem.actions.unarchive') : t('noteListItem.actions.archive')}
            >
              {note.isArchived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="h-8 w-8 p-0"
              style={{ color: theme.status.error }}
              title={t('noteListItem.actions.delete')}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {note.description && (
          <p
            className="text-sm mb-2 line-clamp-2"
            style={{ color: theme.text.secondary }}
          >
            {note.description}
          </p>
        )}

        {/* Content Preview */}
        <div
          className="text-sm leading-relaxed"
          style={{ color: theme.text.muted }}
        >
          {getPreviewContent()}
        </div>

        {/* Expand/Collapse toggle */}
        {note.content && note.content.length > 150 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs mt-2 hover:underline"
            style={{ color: theme.text.muted }}
          >
            {isExpanded ? t('noteListItem.actions.showLess') : t('noteListItem.actions.showMore')}
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteListItem;
