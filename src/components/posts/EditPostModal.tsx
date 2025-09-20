"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ImageIcon, FileIcon, Loader2, Pin, PinOff, Globe, Users, Lock } from "lucide-react";
import { PostData } from "@/types/post";
import { usePostEditor, usePostManagement } from "@/hooks/posts";
import BaseModal from "@/components/ui/modal/BaseModal";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface EditPostModalProps {
  post: PostData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedPost: PostData) => void;
}

interface ExistingImageProps {
  imageId: number;
  imageUrl: string;
  isMarkedForRemoval: boolean;
  onToggleRemoval: (imageId: number) => void;
  t: (key: string) => string;
}

const ExistingImage = ({ imageId, imageUrl, isMarkedForRemoval, onToggleRemoval, t }: ExistingImageProps) => (
  <div className={`relative group ${isMarkedForRemoval ? 'opacity-50' : ''}`}>
    <img
      src={imageUrl}
      alt="Post image"
      className="w-full h-32 object-cover rounded-lg"
    />
    <button
      onClick={() => onToggleRemoval(imageId)}
      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
        isMarkedForRemoval 
          ? 'bg-green-600 text-white' 
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
      title={isMarkedForRemoval ? t('editPost.images.restore') : t('editPost.images.remove')}
    >
      {isMarkedForRemoval ? '↺' : <X className="w-4 h-4" />}
    </button>
    {isMarkedForRemoval && (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
        <span className="text-white text-sm font-medium">{t('editPost.images.willRemove')}</span>
      </div>
    )}
  </div>
);

export default function EditPostModal({ post, isOpen, onClose, onSuccess }: EditPostModalProps) {
  const { user } = useAuth();
  const { updatePost, isEditing, canEditPost } = usePostManagement();
  const { theme, themeMode } = useThemeContext();
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

  // Dynamic theme-based classes
  const getThemeClasses = () => {
    const isDark = themeMode === 'dark';
    return {
      modal: isDark ? 'bg-gray-800' : 'bg-white',
      text: {
        primary: isDark ? 'text-white' : 'text-gray-900',
        secondary: isDark ? 'text-gray-400' : 'text-gray-600',
        muted: isDark ? 'text-gray-500' : 'text-gray-500'
      },
      background: {
        primary: isDark ? 'bg-gray-800' : 'bg-white',
        secondary: isDark ? 'bg-gray-700' : 'bg-gray-100',
        tertiary: isDark ? 'bg-gray-700/50' : 'bg-gray-50',
        hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      },
      border: {
        default: isDark ? 'border-gray-700' : 'border-gray-200',
        muted: isDark ? 'border-gray-600' : 'border-gray-300'
      },
      input: {
        background: 'bg-transparent',
        placeholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-500',
        focus: isDark ? 'focus:border-blue-500' : 'focus:border-blue-600'
      }
    };
  };

  const themeClasses = getThemeClasses();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security check: Only allow editing if user has permission
  useEffect(() => {
    if (isOpen && !canEditPost(post)) {
      console.warn('Unauthorized access to edit modal');
      onClose();
      return;
    }
  }, [isOpen, post, canEditPost, onClose]);

  // Don't render if user doesn't have permission
  if (!canEditPost(post)) {
    return null;
  }

  // Initialize editor with post data
  const {
    editState,
    isProcessing,
    errors,
    updateContent,
    updatePrivacy,
    togglePinned,
    addImages,
    removeImage,
    markImageForRemoval,
    unmarkImageForRemoval,
    addFiles,
    removeFile,
    validate,
    getUpdateData,
    reset,
    hasChanges,
  } = usePostEditor({
    content: post.content,
    privacy: post.privacy,
    isPinned: post.isPinned,
    linkedTaskId: post.linkedTask?.id,
    linkedProjectId: post.linkedProject?.id,
    existingImages: post.imageUrls?.map((url, index) => ({ id: index + 1, url })) || [],
  });

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editState.content]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addImages(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    try {
      const updateData = getUpdateData();
      const response = await updatePost(post.id, updateData, (updatedPost) => {
        onSuccess?.(updatedPost);
        onClose();
      });
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasChanges()) {
      setShowUnsavedWarning(true);
    } else {
      reset();
      onClose();
    }
  };

  // Confirm close without saving
  const handleConfirmClose = () => {
    reset();
    setShowUnsavedWarning(false);
    onClose();
  };

  const privacyOptions = [
    { value: 'PUBLIC' as const, label: t('editPost.privacy.public.label'), icon: Globe, description: t('editPost.privacy.public.description') },
    { value: 'FRIENDS' as const, label: t('editPost.privacy.friends.label'), icon: Users, description: t('editPost.privacy.friends.description') },
    { value: 'PRIVATE' as const, label: t('editPost.privacy.private.label'), icon: Lock, description: t('editPost.privacy.private.description') },
  ];

  const isLoading = isEditing(post.id) || isProcessing;

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={handleClose} maxWidth="lg" showCloseButton={false}>
        <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${themeClasses.modal}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border.default}`}>
            <div className="flex items-center space-x-3">
              <UserAvatar
                name={user?.name || 'User'}
                avatar={user?.avatar}
                size="md"
              />
              <div>
                <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>{t('editPost.title')}</h3>
                <p className={`text-sm ${themeClasses.text.secondary}`}>{t('editPost.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Content Editor */}
            <div>
              <textarea
                ref={textareaRef}
                value={editState.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder={t('editPost.placeholder')}
                className={`w-full ${themeClasses.input.background} ${themeClasses.text.primary} ${themeClasses.input.placeholder} border-none outline-none resize-none text-lg min-h-[100px]`}
                disabled={isLoading}
              />
              {errors.content && (
                <p className="text-red-400 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('editPost.privacy.label')}</label>
              <div className="grid grid-cols-1 gap-2">
                {privacyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePrivacy(option.value)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      editState.privacy === option.value
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : `border ${themeClasses.border.muted} ${themeClasses.background.secondary} ${themeClasses.text.secondary} hover:bg-gray-700`
                    }`}
                    disabled={isLoading}
                  >
                    <option.icon className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pin Settings */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.border.default} ${themeClasses.background.secondary}`}>
              <div className="flex items-center space-x-3">
                {editState.isPinned ? (
                  <Pin className="w-5 h-5 text-blue-400" />
                ) : (
                  <PinOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className={`font-medium ${themeClasses.text.primary}`}>{t('editPost.pin.label')}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>
                    {editState.isPinned ? t('editPost.pin.pinned') : t('editPost.pin.unpinned')}
                  </div>
                </div>
              </div>
              <button
                onClick={togglePinned}
                className={`w-12 h-6 rounded-full transition-colors ${
                  editState.isPinned ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                disabled={isLoading}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    editState.isPinned ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Existing Images */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="space-y-2">
                <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('editPost.images.current')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.imageUrls.map((imageUrl, index) => (
                    <ExistingImage
                      key={index}
                      imageId={index + 1}
                      imageUrl={imageUrl}
                      isMarkedForRemoval={editState.removeImageIds.includes(index + 1)}
                      onToggleRemoval={(imageId) => {
                        if (editState.removeImageIds.includes(imageId)) {
                          unmarkImageForRemoval(imageId);
                        } else {
                          markImageForRemoval(imageId);
                        }
                      }}
                      t={t} // Pass the translation function
                    />
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {editState.images.length > 0 && (
              <div className="space-y-2">
                <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>{t('editPost.images.new')}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {editState.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="New image"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {image.compressionStats && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
                          {image.compressionStats.compressionRatio} nhỏ hơn
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Media */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t('editPost.images.addImages')}</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {errors.images && (
              <p className="text-red-400 text-sm">{errors.images}</p>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between p-4 border-t ${themeClasses.border.default}`}>
            <div className={`text-sm ${themeClasses.text.secondary}`}>
              {hasChanges() ? t('editPost.status.hasChanges') : t('editPost.status.noChanges')}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isLoading}
              >
                {t('editPost.actions.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges() || isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? t('editPost.actions.saving') : t('editPost.actions.save')}</span>
              </Button>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Unsaved Changes Warning */}
      {showUnsavedWarning && (
        <BaseModal isOpen={showUnsavedWarning} onClose={() => setShowUnsavedWarning(false)}>
          <div className={`${themeClasses.modal} rounded-lg p-6 max-w-md mx-4`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
              {t('editPost.unsavedWarning.title')}
            </h3>
            <p className={`${themeClasses.text.secondary} mb-4`}>
              {t('editPost.unsavedWarning.message')}
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                onClick={() => setShowUnsavedWarning(false)}
                variant="outline"
              >
                {t('editPost.unsavedWarning.continueEditing')}
              </Button>
              <Button
                onClick={handleConfirmClose}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('editPost.unsavedWarning.exitWithoutSaving')}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </>
  );
}
