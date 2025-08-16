"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect route to handle legacy backend redirects
// Backend redirects to /auth/callback but we use /(auth)/callback (which maps to /callback)
export default function LegacyAuthCallbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get current URL with all parameters
    const currentUrl = window.location.href;
    
    // Replace /auth/callback with /callback to redirect to the actual callback handler
    const newUrl = currentUrl.replace('/auth/callback', '/callback');
    
    // Redirect to the proper callback route with all parameters preserved
    window.location.replace(newUrl);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Redirecting...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we redirect you to the authentication handler
          </p>
        </div>
      </div>
    </div>
  );
}