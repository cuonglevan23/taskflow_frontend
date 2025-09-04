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

  const handleEdit = useCallback(() => {
    onEdit(note);
  }, [note, onEdit]);

  const handleClick = useCallback(() => {
    // This will be handled by parent component to navigate to detail page
    onEdit(note);
  }, [note, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDelete(note.id);
    }
  }, [note.id, onDelete]);

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
    } catch {
      // If not valid JSON, treat as plain text
      return content.length > maxLength
        ? content.substring(0, maxLength) + '...'
        : content;
    }

    return '';
  };

  const contentPreview = truncateContent(note.content || '');

  return (
    <div
      className="note-list-item p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{
        backgroundColor: note.isArchived
          ? DARK_THEME.background.muted
          : DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default,
        opacity: note.isArchived ? 0.7 : 1
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText
              className="h-4 w-4 flex-shrink-0"
              style={{ color: DARK_THEME.text.muted }}
            />
            <h3
              className="font-medium truncate"
              style={{ color: DARK_THEME.text.primary }}
            >
              {note.title}
            </h3>

            {/* Status badges */}
            <div className="flex items-center gap-1 ml-2">
              {note.isArchived && (
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{
                    backgroundColor: DARK_THEME.status.warning + '20',
                    color: DARK_THEME.status.warning
                  }}
                >
                  Archived
                </span>
              )}

              {note.isProjectNote && (
                <span
                  className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: note.isPublic
                      ? DARK_THEME.status.success + '20'
                      : DARK_THEME.status.info + '20',
                    color: note.isPublic
                      ? DARK_THEME.status.success
                      : DARK_THEME.status.info
                  }}
                >
                  {note.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {note.isPublic ? 'Public' : 'Private'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {note.description && (
            <p
              className="text-sm mb-2 line-clamp-2"
              style={{ color: DARK_THEME.text.muted }}
            >
              {note.description}
            </p>
          )}

          {/* Content Preview */}
          {contentPreview && (
            <p
              className="text-sm line-clamp-3"
              style={{ color: DARK_THEME.text.secondary }}
            >
              {contentPreview}
            </p>
          )}
        </div>

        {/* Actions - Show on hover */}
        <div className={`flex items-center gap-1 ml-4 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="p-1.5 h-auto"
            title="Edit note"
          >
            <Edit3 className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleArchive();
            }}
            className="p-1.5 h-auto"
            title={note.isArchived ? "Restore note" : "Archive note"}
          >
            {note.isArchived ? (
              <ArchiveRestore className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
            ) : (
              <Archive className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
            )}
          </Button>

          {/* Visibility toggle for project notes */}
          {note.isProjectNote && onToggleVisibility && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility();
              }}
              className="p-1.5 h-auto"
              title={note.isPublic ? "Make private" : "Make public"}
            >
              {note.isPublic ? (
                <EyeOff className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
              ) : (
                <Eye className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1.5 h-auto"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" style={{ color: DARK_THEME.status.error }} />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs" style={{ color: DARK_THEME.text.muted }}>
        <div className="flex items-center gap-4">
          {/* Creator info */}
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{note.creatorName}</span>
          </div>

          {/* Project info */}
          {showProjectInfo && note.isProjectNote && note.projectName && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{note.projectName}</span>
            </div>
          )}

          {/* Last updated */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Attachments */}
          {note.hasAttachments && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{note.attachmentCount} file{note.attachmentCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* File size */}
        {note.hasAttachments && (
          <span className="text-xs">
            {note.formattedTotalAttachmentSize}
          </span>
        )}
      </div>

      {/* Expanded content preview */}
      {isExpanded && contentPreview && (
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: DARK_THEME.border.muted }}
        >
          <div
            className="text-sm whitespace-pre-wrap max-h-48 overflow-y-auto"
            style={{ color: DARK_THEME.text.secondary }}
          >
            {contentPreview.length > 300 ? contentPreview.substring(0, 300) + '...' : contentPreview}
          </div>

          {contentPreview.length > 300 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="mt-2 text-xs hover:underline"
              style={{ color: DARK_THEME.background.primary }}
            >
              Read more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteListItem;
