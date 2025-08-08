"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    // Get error message from URL parameters
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else if (error) {
      setErrorMessage(error);
      if (errorDescription) {
        setErrorDetails(decodeURIComponent(errorDescription));
      }
    } else {
      setErrorMessage('An unknown authentication error occurred');
    }
  }, [searchParams]);

  const handleRetryLogin = () => {
    // Clear any stored auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mock_auth_user');
    
    // Redirect to login page
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getErrorIcon = () => {
    return <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
  };

  const getErrorTitle = () => {
    if (errorMessage.toLowerCase().includes('oauth')) {
      return 'OAuth Authentication Failed';
    }
    if (errorMessage.toLowerCase().includes('access')) {
      return 'Access Denied';
    }
    if (errorMessage.toLowerCase().includes('expired')) {
      return 'Session Expired';
    }
    return 'Authentication Error';
  };

  const getErrorDescription = () => {
    if (errorMessage.toLowerCase().includes('oauth')) {
      return 'There was a problem with Google authentication. This could be due to a temporary issue or configuration problem.';
    }
    if (errorMessage.toLowerCase().includes('access')) {
      return 'You do not have permission to access this application. Please contact your administrator.';
    }
    if (errorMessage.toLowerCase().includes('expired')) {
      return 'Your authentication session has expired. Please sign in again.';
    }
    return 'An unexpected error occurred during authentication. Please try again.';
  };

  const getSuggestions = () => {
    const suggestions = [
      'Try signing in again',
      'Check your internet connection',
      'Clear your browser cache and cookies',
    ];

    if (errorMessage.toLowerCase().includes('oauth')) {
      suggestions.push('Make sure you have a Google account');
      suggestions.push('Check if third-party cookies are enabled');
    }

    return suggestions;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {getErrorIcon()}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getErrorDescription()}
          </p>

          {/* Error Details */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Error Details:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {errorMessage}
              </p>
              {errorDetails && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {errorDetails}
                </p>
              )}
            </div>
          )}

          {/* Suggestions */}
          <div className="mt-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              What you can try:
            </h3>
            <ul className="space-y-2">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={handleRetryLogin}
              className="w-full flex items-center justify-center gap-2"
              variant="primary"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}