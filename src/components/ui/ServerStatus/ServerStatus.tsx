"use client";

import React, { useState, useEffect } from 'react';
import { STATUS_ICONS, ACTION_ICONS } from '@/constants/icons';
import { DARK_THEME } from '@/constants/theme';

interface ServerStatusProps {
  className?: string;
  showText?: boolean;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'error';

export default function ServerStatus({ className = '', showText = true }: ServerStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);

  const checkServerHealth = async () => {
    try {
      setStatus('checking');
      // Try a simple health check - using frontend health endpoint
      const response = await fetch('/api/health');
      if (response.ok) {
        setStatus('connected');
        setRetryCount(0);
      } else {
        setStatus('disconnected');
      }
    } catch (error: unknown) {
      const apiError = error as { isConnectionError?: boolean; code?: string; status?: number };
      const isConnectionError = 
        apiError?.isConnectionError || 
        apiError?.code === 'ECONNREFUSED' ||
        apiError?.status === 503;
        
      setStatus(isConnectionError ? 'disconnected' : 'error');
      setRetryCount(prev => prev + 1);
    } finally {
      setLastCheck(new Date());
      setIsManualRetry(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkServerHealth();

    // Set up periodic health checks
    const interval = setInterval(() => {
      // Only check if we're not already checking
      if (status !== 'checking') {
        checkServerHealth();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: STATUS_ICONS.success,
          color: '#10b981', // green
          bgColor: '#10b98120',
          text: 'Kết nối ổn định',
          message: 'Máy chủ hoạt động bình thường'
        };
      case 'disconnected':
        return {
          icon: ACTION_ICONS.close,
          color: '#ef4444', // red
          bgColor: '#ef444420',
          text: 'Mất kết nối',
          message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau vài phút.'
        };
      case 'checking':
        return {
          icon: STATUS_ICONS.pending,
          color: '#3b82f6', // blue
          bgColor: '#3b82f620',
          text: 'Đang kiểm tra...',
          message: 'Đang kiểm tra kết nối máy chủ'
        };
      case 'error':
        return {
          icon: STATUS_ICONS.warning,
          color: '#f59e0b', // yellow
          bgColor: '#f59e0b20',
          text: 'Có lỗi xảy ra',
          message: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleRetry = () => {
    setIsManualRetry(true);
    checkServerHealth();
  };

  return (
    <>
      {/* Chỉ hiển thị khi có vấn đề - ẩn khi connected */}
      {status !== 'connected' && (
        <div className={`flex items-center gap-2 ${className}`}>
          {/* Status Indicator */}
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color 
            }}
            title={statusInfo.message}
          >
            <statusInfo.icon 
              size={16} 
              className={status === 'checking' ? 'animate-spin' : ''}
            />
          </div>

          {/* Status Text */}
          {showText && (
            <div className="flex flex-col">
              <span 
                className="text-sm font-medium"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.text}
              </span>
              <span 
                className="text-xs"
                style={{ color: DARK_THEME.text.muted }}
              >
                Cập nhật: {lastCheck.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Retry Button for disconnected state */}
          {(status === 'disconnected' || status === 'error') && (
            <button
              onClick={handleRetry}
              className="ml-2 px-3 py-1 text-xs rounded transition-colors"
              style={{ 
                backgroundColor: DARK_THEME.background.secondary,
                color: DARK_THEME.text.primary,
                border: `1px solid ${DARK_THEME.border.default}`
              }}
              disabled={isManualRetry}
            >
              {isManualRetry ? 'Đang thử...' : 'Thử lại'}
            </button>
          )}

          {/* Retry Count */}
          {retryCount > 0 && (
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: DARK_THEME.background.secondary,
                color: DARK_THEME.text.muted 
              }}
            >
              Thử lại: {retryCount}
            </span>
          )}
        </div>
      )}
    </>
  );
}
