/**
 * Optimized Session Hook - Thay thế cho useSession từ NextAuth
 * 
 * Sử dụng hook này thay cho:
 * - useSession từ 'next-auth/react' 
 * - useSessionSWR
 * - fetch('/api/auth/session') trực tiếp
 * 
 * Lợi ích:
 * - Chỉ 1 API call duy nhất cho session
 * - Aggressive caching với SWR
 * - Tự động sync giữa các components
 */

// DEPRECATED: useOptimizedSession - Replaced by AuthProvider
// This hook is no longer used - we've switched to backend-only JWT authentication
// See /src/components/auth/AuthProvider.tsx for the new authentication system

/*
 * MIGRATION NOTES:
 * - useSession từ NextAuth đã được loại bỏ
 * - Authentication giờ được handle bởi AuthProvider
 * - Sử dụng useAuth() thay vì useSession()
 *
 * Migration guide:
 * OLD: const { data: session, status } = useSession();
 * NEW: const { user, isLoading, isAuthenticated } = useAuth();
 */

import { useAuth } from '@/components/auth/AuthProvider';

// Deprecated interface - kept for backward compatibility
export interface OptimizedSessionReturn {
  data: any | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
}

// Deprecated hook - kept for backward compatibility
export function useOptimizedSession(): OptimizedSessionReturn {
  console.warn('⚠️ useOptimizedSession is deprecated. Use useAuth from AuthProvider instead.');

  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    data: user ? { user } : null,
    status: isLoading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated'),
    isLoading,
  };
}

// Deprecated export - kept for backward compatibility
export const useSession = useOptimizedSession;
