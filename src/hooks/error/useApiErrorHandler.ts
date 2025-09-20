import { useCallback } from 'react';
import { useNotify } from '@/components/ui/NotificationProvider';

// Types for API errors
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Configuration for different error types
const ERROR_CONFIG = {
  UNAUTHORIZED: {
    title: 'Authentication Required',
    message: 'Please log in to continue',
    shouldRedirect: true,
    redirectPath: '/login'
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action',
    shouldRedirect: false
  },
  NOT_FOUND: {
    title: 'Resource Not Found',
    message: 'The requested resource could not be found',
    shouldRedirect: false
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'An unexpected server error occurred. Please try again later.',
    shouldRedirect: false
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    shouldRedirect: false
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Please check your input and try again',
    shouldRedirect: false
  }
} as const;

/**
 * Custom hook for handling API errors in a consistent way
 * Provides centralized error handling with user-friendly notifications
 */
export const useApiErrorHandler = () => {
  const notify = useNotify();

  // Parse error from different formats
  const parseError = useCallback((error: unknown): ApiError => {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: (error as any).status,
        code: (error as any).code
      };
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: (error as any).message || 'Unknown error',
        status: (error as any).status,
        code: (error as any).code
      };
    }

    return { message: 'An unexpected error occurred' };
  }, []);

  // Get error configuration based on error type
  const getErrorConfig = useCallback((error: ApiError) => {
    const status = error.status;
    const message = error.message.toLowerCase();

    if (status === 401 || message.includes('unauthorized') || message.includes('authentication')) {
      return ERROR_CONFIG.UNAUTHORIZED;
    }

    if (status === 403 || message.includes('forbidden') || message.includes('permission')) {
      return ERROR_CONFIG.FORBIDDEN;
    }

    if (status === 404 || message.includes('not found')) {
      return ERROR_CONFIG.NOT_FOUND;
    }

    if (status === 422 || message.includes('validation') || message.includes('invalid input')) {
      return ERROR_CONFIG.VALIDATION_ERROR;
    }

    if (status && status >= 500) {
      return ERROR_CONFIG.SERVER_ERROR;
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ERROR_CONFIG.NETWORK_ERROR;
    }

    // Default to server error for unknown errors
    return ERROR_CONFIG.SERVER_ERROR;
  }, []);

  // Handle redirect if needed
  const handleRedirect = useCallback((redirectPath: string) => {
    if (typeof window !== 'undefined') {
      // Add a small delay to allow notification to show
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    }
  }, []);

  // Main error handler
  const handleError = useCallback((error: unknown, context?: string) => {
    const parsedError = parseError(error);
    const config = getErrorConfig(parsedError);

    // Log error for debugging
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, parsedError);

    // Show user-friendly notification
    notify.error(config.title, config.message, {
      duration: config.shouldRedirect ? 3000 : 6000,
      action: config.shouldRedirect ? {
        label: 'Login',
        onClick: () => handleRedirect(config.redirectPath!)
      } : undefined
    });

    // Handle redirect if needed
    if (config.shouldRedirect && config.redirectPath) {
      handleRedirect(config.redirectPath);
    }

    return parsedError;
  }, [parseError, getErrorConfig, notify, handleRedirect]);

  // Specific handlers for common scenarios
  const handleApiError = useCallback((error: unknown, operation: string) => {
    return handleError(error, `${operation} operation`);
  }, [handleError]);

  const handleAuthError = useCallback((error: unknown) => {
    return handleError(error, 'Authentication');
  }, [handleError]);

  const handleValidationError = useCallback((error: unknown, fieldName?: string) => {
    const context = fieldName ? `${fieldName} validation` : 'Validation';
    return handleError(error, context);
  }, [handleError]);

  // Async wrapper for API calls with automatic error handling
  const withErrorHandling = useCallback(<T>(
    apiCall: () => Promise<T>,
    context?: string
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await apiCall();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleAuthError,
    handleValidationError,
    withErrorHandling,
    parseError
  };
};

export default useApiErrorHandler;
