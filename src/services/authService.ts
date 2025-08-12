// Real Auth Service - Spring Boot + JWT + Google OAuth with HttpOnly Secure Cookies
import { api } from './api';
import type { User, UserWithRole } from '@/types/roles';

interface GoogleAuthResponse {
  user: UserWithRole;
  // Tokens are now handled via HttpOnly cookies, not returned in response
  success: boolean;
}

interface AuthTokens {
  success: boolean;
  // Tokens are now handled via HttpOnly cookies
}

export const authService = {
  // Google OAuth login
  loginWithGoogle: async (authorizationCode: string): Promise<GoogleAuthResponse> => {
    const response = await api.post<GoogleAuthResponse>('/auth/google', {
      code: authorizationCode,
      redirectUri: `${window.location.origin}/auth/callback`
    }, {
      // Ensure cookies are included in requests
      withCredentials: true
    });
    
    // Tokens are now automatically stored in HttpOnly Secure cookies by the server
    // No client-side token storage needed
    
    return response.data;
  },

  // Get current user - Using NextAuth.js API route
  getCurrentUser: async (): Promise<UserWithRole> => {
    const response = await api.get<UserWithRole>('/api/auth/me', {
      // Ensure cookies are included in requests
      withCredentials: true
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<AuthTokens> => {
    // Refresh token is automatically sent via HttpOnly cookie
    const response = await api.post<AuthTokens>('/auth/refresh', {}, {
      // Ensure cookies are included in requests
      withCredentials: true
    });

    // New tokens are automatically stored in HttpOnly Secure cookies by the server
    // No client-side token storage needed

    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    // Send logout request - server will clear HttpOnly cookies
    await api.post('/auth/logout', {}, {
      withCredentials: true
    });
    // HttpOnly cookies are automatically cleared by the server
    // No client-side storage to clear
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // Check authentication status by calling a protected endpoint
      await api.get('/auth/verify', {
        withCredentials: true
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Verify authentication status (synchronous check for initial load)
  hasValidSession: (): boolean => {
    // Since we can't access HttpOnly cookies from JavaScript,
    // we need to rely on server-side verification
    // This method is mainly for initial state - use isAuthenticated() for actual checks
    return true; // Will be verified by server on first API call
  }
};