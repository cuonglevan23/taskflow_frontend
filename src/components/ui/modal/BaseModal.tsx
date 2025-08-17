"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { X } from "lucide-react";
import { Z_INDEX } from "@/styles/z-index";

/* ===================== Types ===================== */
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'fullscreen';
  height?: 'auto' | 'screen' | 'fit' | string;
  showCloseButton?: boolean;
  showHeader?: boolean;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  backdropClickToClose?: boolean;
  zIndex?: number;
}

/* ===================== Size Mappings ===================== */
const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  fullscreen: 'max-w-none w-screen h-screen',
};

const HEIGHT_CLASSES = {
  auto: 'h-auto',
  screen: 'h-screen',
  fit: 'h-fit',
};

/* ===================== Main Component ===================== */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  height = 'auto',
  showCloseButton = true,
  showHeader = true,
  className = '',
  backdropClassName = '',
  contentClassName = '',
  headerClassName = '',
  footerClassName = '',
  backdropClickToClose = true,
  zIndex = Z_INDEX.modal,
}: BaseModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdropClickToClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  const isFullscreen = maxWidth === 'fullscreen';
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth];
  const heightClass = typeof height === 'string' && HEIGHT_CLASSES[height as keyof typeof HEIGHT_CLASSES] 
    ? HEIGHT_CLASSES[height as keyof typeof HEIGHT_CLASSES]
    : '';
  
  const heightStyle = typeof height === 'string' && !HEIGHT_CLASSES[height as keyof typeof HEIGHT_CLASSES]
    ? { height }
    : {};

  return (
    <div 
      className={`fixed inset-0 ${isFullscreen ? '' : 'flex items-center justify-center'} ${backdropClassName}`}
      style={{ zIndex }}
    >
      {/* Backdrop - Hidden for fullscreen */}
      {!isFullscreen && (
        <div
          className="absolute inset-0 cursor-pointer"
          style={{ backgroundColor: 'rgba(66, 66, 68, 0.4)' }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Modal */}
      <div
        className={`relative ${isFullscreen ? 'w-screen h-screen' : `w-full mx-4 rounded-xl shadow-2xl`} overflow-hidden ${isFullscreen ? '' : maxWidthClass} ${heightClass} ${className}`}
        style={{
          backgroundColor: theme.background.primary,
          zIndex: Z_INDEX.popover,
          ...heightStyle,
        }}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <div 
            className={`flex items-center justify-between p-6 border-b ${headerClassName}`}
            style={{ 
              backgroundColor: theme.background.primary,
              borderBottomColor: theme.border.default,
            }}
          >
            {title && (
              <h1 
                className="text-xl font-semibold"
                style={{ color: theme.text.primary }}
              >
                {title}
              </h1>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors ml-auto"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`${height === 'screen' || heightClass === 'h-screen' ? 'flex-1 overflow-auto' : ''} ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div 
            className={`border-t ${footerClassName}`}
            style={{ 
              backgroundColor: theme.background.primary,
              borderTopColor: theme.border.default,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Convenience Components ===================== */

// Standard modal with padding
export function Modal(props: BaseModalProps) {
  return (
    <BaseModal
      {...props}
      contentClassName={`p-6 ${props.contentClassName || ''}`}
      footerClassName={`p-6 ${props.footerClassName || ''}`}
    />
  );
}

// Large modal for settings/complex forms  
export function LargeModal(props: BaseModalProps) {
  return (
    <BaseModal
      {...props}
      maxWidth="6xl"
      height="screen"
      contentClassName={`flex-1 overflow-auto ${props.contentClassName || ''}`}
    />
  );
}

// Fullscreen modal that covers entire viewport
export function FullscreenModal(props: BaseModalProps) {
  return (
    <BaseModal
      {...props}
      maxWidth="fullscreen"
      height="screen"
      showHeader={false}
      backdropClickToClose={false}
      className={`m-0 rounded-none ${props.className || ''}`}
      contentClassName={`flex-1 overflow-auto ${props.contentClassName || ''}`}
    />
  );
}

// Confirmation modal
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}) {
  const { theme } = useTheme();
  
  const confirmButtonStyle = variant === "danger" 
    ? { backgroundColor: '#ef4444', color: 'white' }
    : { backgroundColor: '#3b82f6', color: 'white' };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <div className="flex justify-end space-x-3 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg transition-colors"
            style={confirmButtonStyle}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="p-6">
        <p style={{ color: theme.text.primary }}>
          {message}
        </p>
      </div>
    </BaseModal>
  );
}

/* ===================== Export Types ===================== */
export type { BaseModalProps };