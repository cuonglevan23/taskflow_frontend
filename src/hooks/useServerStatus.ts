"use client";

import { useState, useEffect, useCallback } from 'react';

export type ServerConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'error';

interface UseServerStatusOptions {
  checkInterval?: number; // milliseconds
  enableAutoCheck?: boolean;
}

interface UseServerStatusReturn {
  status: ServerConnectionStatus;
  lastCheck: Date;
  retryCount: number;
  isChecking: boolean;
  checkServerHealth: () => Promise<void>;
  isOnline: boolean;
}

export function useServerStatus(options: UseServerStatusOptions = {}): UseServerStatusReturn {
  const { checkInterval = 30000, enableAutoCheck = true } = options;
  
  const [status, setStatus] = useState<ServerConnectionStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const checkServerHealth = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // Use the frontend health endpoint instead of backend actuator
      const response = await fetch('/api/health');
      const isHealthy = response.ok;
      
      setStatus(isHealthy ? 'connected' : 'disconnected');
      if (isHealthy) {
        setRetryCount(0); // Reset retry count on successful connection
      }
    } catch (error) {
      // Enhanced error detection
      const apiError = error as Error & {
        isConnectionError?: boolean;
        code?: string;
        status?: number;
      };
      const isConnectionError = 
        apiError?.isConnectionError || 
        apiError?.code === 'ECONNREFUSED' ||
        apiError?.status === 503 ||
        !navigator.onLine;
        
      setStatus(isConnectionError ? 'disconnected' : 'error');
      setRetryCount(prev => prev + 1);
    } finally {
      setLastCheck(new Date());
      setIsChecking(false);
    }
  }, [isChecking]);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkServerHealth();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkServerHealth]);

  // Auto check server health
  useEffect(() => {
    if (!enableAutoCheck) return;

    // Initial check
    checkServerHealth();

    // Set up periodic checks with adaptive interval
    const getCheckInterval = () => {
      // Khi connected: check ít hơn (5 phút)
      // Khi có vấn đề: check thường xuyên hơn (30 giây)
      return status === 'connected' ? 300000 : checkInterval;
    };

    const interval = setInterval(() => {
      if (!isChecking && isOnline) {
        checkServerHealth();
      }
    }, getCheckInterval());

    return () => clearInterval(interval);
  }, [checkServerHealth, enableAutoCheck, checkInterval, isChecking, isOnline, status]);

  return {
    status,
    lastCheck,
    retryCount,
    isChecking,
    checkServerHealth,
    isOnline,
  };
}

// Helper function to check if an error is a connection error
export function isConnectionError(error: unknown): boolean {
  const apiError = error as { 
    isConnectionError?: boolean; 
    code?: string; 
    status?: number; 
    userMessage?: string;
  };
  
  return (
    apiError?.isConnectionError === true ||
    apiError?.code === 'ECONNREFUSED' ||
    apiError?.code === 'ENOTFOUND' ||
    apiError?.code === 'ETIMEDOUT' ||
    apiError?.status === 503 ||
    !navigator.onLine
  );
}

// Helper function to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  const apiError = error as { userMessage?: string };
  
  if (apiError?.userMessage) {
    return apiError.userMessage;
  }
  
  if (isConnectionError(error)) {
    return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau vài phút.';
  }
  
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}
