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

import { useSession as useUnifiedSession } from '@/contexts/SessionContext';

// Export một interface tương thích với NextAuth useSession
export interface UseSessionReturn {
  data: {
    user?: unknown;
    [key: string]: unknown;
  } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

/**
 * Hook tối ưu hóa cho session - SINGLE SOURCE OF TRUTH
 * Thay thế tất cả useSession() calls trong app
 */
export function useOptimizedSession(): UseSessionReturn {
  const { data, status } = useUnifiedSession();
  
  return {
    data,
    status,
  };
}

// Legacy compatibility exports
export const useSession = useOptimizedSession;
export default useOptimizedSession;
