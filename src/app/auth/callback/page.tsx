"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

// NextAuth standard callback handler
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // If already authenticated, redirect immediately
    if (sessionStatus === 'authenticated' && session) {
      setStatus('success');
      router.push('/home');
      return;
    }

    // If still loading session, wait
    if (sessionStatus === 'loading') {
      return;
    }

    // Handle OAuth callback only if not authenticated
    const handleCallback = async () => {
      try {
        // Get OAuth parameters from backend redirect
        const accessToken = searchParams.get('access_token');
        const userEmail = searchParams.get('email');
        const userName = searchParams.get('name') || 
                        `${searchParams.get('first_name') || ''} ${searchParams.get('last_name') || ''}`.trim();
        const userAvatar = searchParams.get('avatar_url');
        
        if (!accessToken || !userEmail) {
          throw new Error('Missing required OAuth parameters');
        }

        // Decode JWT to get role
        const decodeJWT = (token: string) => {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.roles?.[0] || payload.role || 'MEMBER';
          } catch {
            return 'MEMBER';
          }
        };

        const userRole = decodeJWT(accessToken);

        // Sign in with NextAuth using backend OAuth data (only once)
        const result = await signIn('backend-oauth', {
          token: accessToken,
          email: decodeURIComponent(userEmail),
          name: userName || decodeURIComponent(userEmail),
          role: userRole,
          avatar: userAvatar ? decodeURIComponent(userAvatar) : '',
          redirect: false,
        });

        if (result?.error) {
          throw new Error(`NextAuth sign in failed: ${result.error}`);
        }

        // Let useSession hook handle the rest
        setStatus('success');

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        
        // Redirect to login on error
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, session, sessionStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <h2 className="mt-6 text-xl font-bold text-white">Completing sign in...</h2>
            <p className="mt-2 text-gray-400">Please wait while we verify your account</p>
          </>
        )}
        
        {(status === 'success' || sessionStatus === 'authenticated') && (
          <>
            <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">Sign in successful!</h2>
            <p className="mt-2 text-gray-400">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">Sign in failed</h2>
            <p className="mt-2 text-gray-400">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
}