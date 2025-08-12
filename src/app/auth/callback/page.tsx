"use client"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CookieAuth } from '@/utils/cookieAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get OAuth parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth Error: ${error}`);
        }

        // Check different callback scenarios - define all parameters first
        const token = searchParams.get('token');
        const accessToken = searchParams.get('access_token'); // Alternative parameter name
        const refreshTokenParam = searchParams.get('refresh_token');
        const errorParam = searchParams.get('error');
        const userEmail = searchParams.get('email');
        const userName = searchParams.get('name');
        const userAvatar = searchParams.get('avatar_url');
        const userId = searchParams.get('user_id');
        const firstName = searchParams.get('first_name');
        const lastName = searchParams.get('last_name');
        const isFirstLogin = searchParams.get('is_first_login');
        const expiresIn = searchParams.get('expires_in');
        const tokenType = searchParams.get('token_type');
        
        // Debug: Log what we received (disabled to prevent spam)
        // console.log('=== OAuth Callback Debug ===');
        // console.log('Code parameter:', code);
        // console.log('Access token parameter:', accessToken);
        // console.log('User email parameter:', userEmail);
        // console.log('All parameters:', Object.fromEntries(searchParams.entries()));

        // Handle error from backend
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        // Check if we have tokens (backend processed OAuth) or code (need to process)
        if (!code && !accessToken && !token) {
          throw new Error('No authorization code or access token received');
        }
        
        if (token || accessToken) {
          // Scenario 1: Backend successfully processed and redirected with tokens
          console.log('=== OAuth Callback Success ===');
          console.log('Received tokens from backend redirect');
          console.log('All URL parameters:', Object.fromEntries(searchParams.entries()));
          const finalToken = token || accessToken;
          console.log('Final token length:', finalToken?.length);

          // Helper function to decode JWT and extract role
          const decodeJWT = (token: string) => {
            try {
              const base64Payload = token.split('.')[1];
              const payload = JSON.parse(atob(base64Payload));
              console.log('Decoded JWT payload:', payload);
              return payload;
            } catch (error) {
              console.error('Failed to decode JWT:', error);
              return null;
            }
          };

          // Decode JWT to get role from backend
          const jwtPayload = decodeJWT(finalToken);
          const backendRole = jwtPayload?.roles?.[0] || jwtPayload?.role;
          
          // Store tokens in cookies (secure)
          CookieAuth.setAccessToken(finalToken);
          if (refreshTokenParam) {
            CookieAuth.setRefreshToken(refreshTokenParam);
          }

          // Create user object from URL parameters or fetch from backend
          let user;
          
          if (userEmail) {
            // User info provided in URL parameters from backend
            const decodedEmail = decodeURIComponent(userEmail);
            const decodedFirstName = firstName ? decodeURIComponent(firstName.replace(/\+/g, ' ')) : '';
            const decodedLastName = lastName ? decodeURIComponent(lastName.replace(/\+/g, ' ')) : '';
            const decodedAvatar = userAvatar ? decodeURIComponent(userAvatar) : '';
            
            const fullName = decodedFirstName && decodedLastName 
              ? `${decodedFirstName} ${decodedLastName}`.trim()
              : userName || decodedEmail;
              
            user = {
              id: userId || 'oauth-' + Date.now(),
              email: decodedEmail,
              name: fullName,
              role: backendRole || 'MEMBER', // Use role from JWT payload
              avatar: decodedAvatar,
              isFirstLogin: isFirstLogin === 'true'
            };
            console.log('User info extracted from backend URL parameters:', user);
          } else {
            // Fallback: Get user info from backend
            try {
              const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                headers: {
                  'Authorization': `Bearer ${finalToken}`,
                },
              });

              if (userResponse.ok) {
                const backendUser = await userResponse.json();
                user = {
                  id: backendUser.id?.toString() || 'oauth-' + Date.now(),
                  email: backendUser.email,
                  name: backendUser.name || `${backendUser.firstName} ${backendUser.lastName}`.trim(),
                  role: backendRole || backendUser.role || 'MEMBER', // Prioritize JWT role
                  avatar: backendUser.avatar || backendUser.avatarUrl || '',
                  isFirstLogin: backendUser.isFirstLogin || false
                };
                console.log('User info fetched from backend:', user);
              } else {
                throw new Error('Failed to get user information from backend');
              }
            } catch (fetchError) {
              console.warn('Failed to fetch user from backend, using default:', fetchError);
              // Default user if backend fetch fails
              user = {
                id: 'oauth-' + Date.now(),
                email: 'user@example.com',
                name: 'OAuth User',
                role: backendRole || 'MEMBER', // Use JWT role even in fallback
                avatar: '',
                isFirstLogin: false
              };
            }
          }

          // Store user data in cookies (not localStorage)
          const setCookie = (name: string, value: string, days: number = 7) => {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            // URL encode the value to handle special characters
            const encodedValue = encodeURIComponent(value);
            document.cookie = `${name}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          };
          
          // Set user data cookies - match middleware expectation
          setCookie('access_token', finalToken);
          setCookie('userRole', user.role || 'member');
          setCookie('userId', user.id);
          setCookie('userName', user.name);
          setCookie('userEmail', user.email);
          if (user.avatar) {
            setCookie('userAvatar', user.avatar);
          }
          
          // Also store refresh token if available
          if (refreshTokenParam) {
            setCookie('refresh_token', refreshTokenParam);
          }
          
          // Sign in with NextAuth using backend OAuth data
          try {
            const result = await signIn('backend-oauth', {
              token: finalToken,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
              redirect: false,
            });

            if (result?.error) {
              throw new Error(`NextAuth sign in failed: ${result.error}`);
            }

            console.log('NextAuth sign in successful');
          } catch (loginError) {
            console.error('NextAuth sign in failed:', loginError);
            throw loginError;
          }
        }

        setStatus('success');
        
        // Redirect to home after successful login
        setTimeout(() => {
          router.push('/home');
        }, 2000);

      } catch (err) {
        console.error('=== OAuth Callback Error ===');
        console.error('Error details:', err);
        console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
        console.error('URL parameters:', Object.fromEntries(searchParams.entries()));
        
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus('error');
        
        // Redirect to error page after error
        setTimeout(() => {
          router.push(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Completing sign in...
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we verify your account
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Sign in successful!
              </h2>
              <p className="mt-2 text-gray-600">
                Redirecting to dashboard...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Sign in failed
              </h2>
              <p className="mt-2 text-gray-600">
                {error || 'An error occurred during authentication'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}