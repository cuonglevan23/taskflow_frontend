"use client";

import React, { useCallback, useRef, useState } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ChatMessage } from '@/types/chat';
import FileAttachmentButton from './FileAttachmentButton';
import ImageAttachmentButton from './ImageAttachmentButton';
import AttachmentPreview from './AttachmentPreview';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onSendWithAttachments: (content: string, files: File[], images: File[]) => void;
  replyToMessage?: ChatMessage | null;
  onCancelReply: () => void;
  isConnected: boolean;
  disabled?: boolean;
}

export interface AttachmentFile {
  id: string;
  file: File;
  type: 'image' | 'file';
  preview?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onSendWithAttachments,
  replyToMessage,
  onCancelReply,
  isConnected,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // Handle file attachments
  const handleFileSelect = useCallback((files: File[]) => {
    const newAttachments: AttachmentFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      type: 'file'
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  // Handle image attachments
  const handleImageSelect = useCallback((files: File[]) => {
    const newAttachments: AttachmentFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      type: 'image',
      preview: URL.createObjectURL(file)
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  // Remove attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(att => att.id !== id);
    });
  }, []);

  // Enhanced send message with attachments
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if ((!inputValue.trim() && attachments.length === 0) || !isConnected || disabled) {
      return;
    }

    if (attachments.length > 0) {
      // Separate images and files
      const images = attachments.filter(att => att.type === 'image').map(att => att.file);
      const files = attachments.filter(att => att.type === 'file').map(att => att.file);

      onSendWithAttachments(inputValue.trim(), files, images);

      // Clean up previews
      attachments.forEach(att => {
        if (att.preview) URL.revokeObjectURL(att.preview);
      });
      setAttachments([]);
    } else {
      onSendMessage(e);
    }
  }, [inputValue, attachments, isConnected, disabled, onSendMessage, onSendWithAttachments]);

  // Enhanced key down handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    } else {
      onKeyDown(e);
    }
  }, [handleSubmit, onKeyDown]);

  const hasContent = inputValue.trim() || attachments.length > 0;

  return (
    <div
      className="flex-shrink-0 border-t"
      style={{
        backgroundColor: DARK_THEME.header.background,
        borderColor: DARK_THEME.border.default
      }}
    >
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="p-3 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: THEME_COLORS.primary[500] }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
                <span
                  className="text-xs font-medium"
                  style={{ color: THEME_COLORS.primary[500] }}
                >
                  Replying to {replyToMessage.senderName}
                </span>
              </div>
              <p
                className="text-sm truncate"
                style={{ color: DARK_THEME.text.secondary }}
              >
                {replyToMessage.content}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 rounded-full transition-colors hover:bg-opacity-10"
              style={{ color: DARK_THEME.text.muted }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />
      )}

      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          {/* Attachment Buttons */}
          <div className="flex items-center gap-1">
            <ImageAttachmentButton
              onImageSelect={handleImageSelect}
              disabled={disabled || !isConnected}
            />
            <FileAttachmentButton
              onFileSelect={handleFileSelect}
              disabled={disabled || !isConnected}
            />
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={onInputChange}
              onKeyDown={handleKeyDown}
              placeholder={replyToMessage
                ? `Reply to ${replyToMessage.senderName}...`
                : isConnected ? "Type a message..." : "Disconnected"
              }
              disabled={!isConnected || disabled}
              rows={1}
              className="w-full px-4 py-2 rounded-2xl border focus:outline-none focus:ring-2 disabled:opacity-50 resize-none"
              style={{
                backgroundColor: DARK_THEME.search.background,
                color: DARK_THEME.search.text,
                borderColor: DARK_THEME.border.default,
                minHeight: '40px',
                maxHeight: '120px'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!hasContent || !isConnected || disabled}
            className="p-2 rounded-full transition-colors disabled:opacity-50"
            style={{
              backgroundColor: hasContent && isConnected && !disabled
                ? THEME_COLORS.primary[500]
                : DARK_THEME.background.muted,
              color: '#ffffff',
              width: '40px',
              height: '40px'
            }}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
