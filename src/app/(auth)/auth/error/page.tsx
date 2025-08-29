// Auth Error Handler - Xử lý lỗi authentication
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('Có lỗi xảy ra trong quá trình đăng nhập');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }

    // Auto redirect sau 5 giây
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="rounded-full h-16 w-16 bg-red-100 mx-auto flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Đăng nhập thất bại
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            {errorMessage}
          </p>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Thử lại
            </button>

            <p className="text-xs text-gray-500">
              Tự động chuyển hướng sau 5 giây...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
