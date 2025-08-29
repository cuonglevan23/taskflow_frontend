// Auth Callback Handler - Xử lý callback từ Google OAuth
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth-backend';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kiểm tra nếu có error từ backend
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (error) {
          setStatus('error');
          setMessage(errorMessage || 'Đăng nhập thất bại');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // Kiểm tra authentication status bằng endpoint đúng
        console.log('🔄 Verifying authentication via /api/user-profiles/me');
        const isAuthenticated = await AuthService.checkAuth();

        if (isAuthenticated) {
          setStatus('success');
          setMessage('Đăng nhập thành công! Đang chuyển hướng...');

          // Redirect to home
          const returnUrl = localStorage.getItem('returnUrl') || '/home';
          localStorage.removeItem('returnUrl');

          setTimeout(() => {
            router.push(returnUrl);
          }, 1500);
        } else {
          throw new Error('Authentication verification failed - user not authenticated');
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        setStatus('error');
        setMessage('Xác thực thất bại. Vui lòng thử lại.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Đang xử lý đăng nhập
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900">
                Đăng nhập thành công!
              </h2>
              <p className="text-green-700">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900">
                Đăng nhập thất bại
              </h2>
              <p className="text-red-700">{message}</p>
              <p className="text-sm text-gray-500">
                Đang chuyển hướng về trang đăng nhập...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
