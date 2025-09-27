// Auth Callback Handler - Xử lý callback từ Google OAuth
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useThemeContext();
  const { refreshAuth } = useAuth(); // Add useAuth hook

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing login...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (hasProcessed) return;

    const handleCallback = async () => {
      try {
        setHasProcessed(true);

        // Kiểm tra nếu có error từ backend
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (error) {
          setStatus('error');
          setMessage(errorMessage || 'Login failed');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/user-profiles/me`, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            await response.json(); // Verify response but don't need to store userData

            setStatus('success');
            setMessage('Login successful! Loading your data...');

            // ✅ CRITICAL FIX: Trigger AuthProvider refresh to update authentication state
            await refreshAuth();

            setMessage('Login successful! Redirecting...');

            setTimeout(() => {
              router.replace('/home');
            }, 1000);
          } else {
            setStatus('error');
            setMessage('Authentication verification failed');
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }
        } catch (fetchError) {
          setStatus('error');
          setMessage('Authentication verification failed');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [hasProcessed, searchParams, router, refreshAuth]); // Add refreshAuth to dependencies

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
               style={{ borderColor: theme.button?.primary?.background || '#3b82f6', borderTopColor: 'transparent' }}>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: theme.status?.success || '#22c55e' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: theme.status?.error || '#ef4444' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return theme.status?.success || '#22c55e';
      case 'error':
        return theme.status?.error || '#ef4444';
      default:
        return theme.text?.primary || '#374151';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background?.primary || '#ffffff' }}
    >
      <div
        className="max-w-md w-full mx-4 p-8 rounded-xl shadow-lg text-center"
        style={{
          backgroundColor: theme.background?.secondary || '#f9fafb',
          borderColor: theme.border?.default || '#e5e7eb'
        }}
      >
        {getStatusIcon()}

        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: theme.text?.primary || '#374151' }}
        >
          {getStatusTitle()}
        </h1>

        <p
          className="text-lg mb-6"
          style={{ color: getStatusColor() }}
        >
          {message}
        </p>

        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: theme.button?.primary?.background || '#3b82f6',
                color: theme.button?.primary?.text || '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.button?.primary?.hover || '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.button?.primary?.background || '#3b82f6';
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        {status === 'loading' && (
          <p
            className="text-sm mt-4"
            style={{ color: theme.text?.secondary || '#6b7280' }}
          >
            Please wait while we verify your authentication...
          </p>
        )}
      </div>
    </div>
  );
}
