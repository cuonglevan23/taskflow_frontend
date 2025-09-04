// Authentication Guard Component - Based on BLOCKNOTE_NOTE_API_INTEGRATION_GUIDE.md
// Ensures user is authenticated before accessing note features

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard(props: AuthGuardProps) {
  const { children, redirectTo = '/auth/login' } = props;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔒 Checking authentication status...');

      // Check authentication by calling user profile endpoint
      // Following docs pattern with HTTP-only cookies
      const response = await fetch('/api/user-profiles/me', {
        method: 'GET',
        credentials: 'include', // HTTP-only cookies
      });

      if (response.ok) {
        const user = await response.json();
        console.log('✅ User authenticated:', user.email);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        console.log('🔒 User not authenticated, redirecting to login...');
        setIsAuthenticated(false);
        router.push(redirectTo);
      } else {
        console.error('❌ Authentication check failed:', response.status);
        setIsAuthenticated(false);
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('❌ Authentication check error:', error);
      setIsAuthenticated(false);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show protected content if authenticated
  return <>{children}</>;
}
