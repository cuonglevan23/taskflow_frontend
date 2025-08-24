"use client";

import React from 'react';
import { STATUS_ICONS, ACTION_ICONS } from '@/constants/icons';
import { DARK_THEME } from '@/constants/theme';
import ServerStatus from './ServerStatus';

interface ConnectionErrorFallbackProps {
  error?: unknown;
  retry?: () => void;
  title?: string;
  message?: string;
  showServerStatus?: boolean;
}

export default function ConnectionErrorFallback({
  error,
  retry,
  title = 'Không thể kết nối đến máy chủ',
  message = 'Vui lòng kiểm tra kết nối mạng và thử lại sau vài phút.',
  showServerStatus = true
}: ConnectionErrorFallbackProps) {
  
  const isConnectionError = 
    (error as { isConnectionError?: boolean; code?: string; status?: number })?.isConnectionError ||
    (error as { isConnectionError?: boolean; code?: string; status?: number })?.code === 'ECONNREFUSED' ||
    (error as { isConnectionError?: boolean; code?: string; status?: number })?.status === 503 ||
    !navigator.onLine;

  const getErrorIcon = () => {
    if (isConnectionError) {
      return STATUS_ICONS.error;
    }
    return STATUS_ICONS.warning;
  };

  const getErrorColor = () => {
    if (isConnectionError) {
      return '#ef4444'; // red
    }
    return '#f59e0b'; // yellow
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8 rounded-lg border"
      style={{ 
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default
      }}
    >
      {/* Error Icon */}
      <div 
        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ 
          backgroundColor: `${getErrorColor()}20`,
          color: getErrorColor()
        }}
      >
        {React.createElement(getErrorIcon(), { size: 32 })}
      </div>

      {/* Error Title */}
      <h3 
        className="text-lg font-semibold mb-2 text-center"
        style={{ color: DARK_THEME.text.primary }}
      >
        {title}
      </h3>

      {/* Error Message */}
      <p 
        className="text-sm text-center mb-6 max-w-md"
        style={{ color: DARK_THEME.text.secondary }}
      >
        {message}
      </p>

      {/* Server Status Component */}
      {showServerStatus && (
        <div className="mb-6">
          <ServerStatus showText={true} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {retry && (
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 rounded transition-colors hover:opacity-80"
            style={{ 
              backgroundColor: '#3b82f6',
              color: '#ffffff'
            }}
          >
            <ACTION_ICONS.arrowLeft size={16} />
            Thử lại
          </button>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
          style={{ 
            backgroundColor: DARK_THEME.background.tertiary,
            color: DARK_THEME.text.secondary,
            border: `1px solid ${DARK_THEME.border.default}`
          }}
        >
          <STATUS_ICONS.pending size={16} />
          Tải lại trang
        </button>
      </div>

      {/* Additional Help Text */}
      <div 
        className="mt-6 text-xs text-center"
        style={{ color: DARK_THEME.text.muted }}
      >
        <p>Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ bộ phận hỗ trợ.</p>
      </div>
    </div>
  );
}
