"use client";

import React, { Component, ReactNode } from 'react';
import { ConnectionErrorFallback } from '@/components/ui/ServerStatus';
import { isConnectionError, getErrorMessage } from '@/hooks/useServerStatus';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ServerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ServerErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error} retry={this.handleRetry} />;
      }

      // Check if it's a connection error
      if (isConnectionError(error)) {
        return (
          <ConnectionErrorFallback
            error={error}
            retry={this.handleRetry}
            title="Không thể kết nối đến máy chủ"
            message={getErrorMessage(error)}
            showServerStatus={true}
          />
        );
      }

      // Default error fallback
      return (
        <ConnectionErrorFallback
          error={error}
          retry={this.handleRetry}
          title="Có lỗi xảy ra"
          message="Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
          showServerStatus={false}
        />
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
interface UseErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

export function useErrorBoundary() {
  const [state, setState] = React.useState<UseErrorBoundaryState>({
    error: null,
    hasError: false,
  });

  const captureError = React.useCallback((error: Error) => {
    setState({ error, hasError: true });
  }, []);

  const resetError = React.useCallback(() => {
    setState({ error: null, hasError: false });
  }, []);

  // Throw error in render to trigger error boundary
  if (state.hasError && state.error) {
    throw state.error;
  }

  return { captureError, resetError };
}
