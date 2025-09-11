// Simple Backend-only Authentication Service
// Optimized with flow: Authorization Bearer + Auto Refresh + Retry
import BaseApiClient from './baseApiClient';

export class AuthService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  private static _isLoggingOut = false;

  /**
   * Initialize Google login
   * Redirect user to backend OAuth endpoint
   */
  static async loginWithGoogle(): Promise<void> {
    try {
      console.log('🔑 Initiating Google OAuth login...');

      // Use full URL with explicit BASE_URL to avoid relative URL issues
      const fullUrl = `${this.BASE_URL}/api/auth/google/url`;
      console.log(`Calling Google auth URL endpoint: ${fullUrl}`);

      // Call backend to get Google auth URL - using try/catch with full error logging
      try {
        const data = await BaseApiClient.get(fullUrl);
        console.log('Response received:', data);

        if (!data?.authUrl) {
          throw new Error('Invalid authentication URL received from server');
        }

        console.log('✅ Got Google auth URL, redirecting to:', data.authUrl);

        // Redirect user to Google OAuth consent screen - using direct window.location for reliable redirect
        window.location.href = data.authUrl;
      } catch (fetchError) {
        console.error('Failed to fetch auth URL:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  static async checkAuth(): Promise<boolean> {
    try {
      await BaseApiClient.get('/api/user-profiles/me');
      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  /**
   * Get current user information from backend
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const data = await BaseApiClient.get('/api/user-profiles/me');

      return {
        id: data.id || data.userId,
        email: data.email,
        name: data.name || data.displayName,
        role: data.role || 'MEMBER',
        avatar: data.avatar || data.avatarUrl
      };
    } catch (error) {
      console.error('❌ Get user info failed:', error);
      return null;
    }
  }

  /**
   * Logout - Clear cookies and client data
   */
  static async logout(): Promise<void> {
    // Prevent multiple simultaneous logout calls
    if (this._isLoggingOut) {
      console.log('🔄 Logout already in progress, skipping...');
      return;
    }

    this._isLoggingOut = true;

    try {
      console.log('🚪 Logging out...');

      // Try calling logout API to clear HTTP-only cookies
      try {
        await BaseApiClient.post('/api/auth/logout');
        console.log('✅ Logout API successful');
      } catch (error) {
        console.warn('⚠️ Logout API failed, but proceeding', error);
      }

      // Clear other app data
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove = ['user-temp-data', 'draft-posts', 'ui-state', 'access_token'];
          keysToRemove.forEach(key => localStorage.removeItem(key));
          sessionStorage.clear();
          console.log('✅ Client-side cleanup completed');
        } catch (cleanupError) {
          console.warn('⚠️ Client-side cleanup failed:', cleanupError);
        }
      }
    } finally {
      this._isLoggingOut = false;

      // Always redirect to login page
      console.log('🔄 Redirecting to login page...');
      if (typeof window !== 'undefined') {
        // Use replace to prevent adding to browser history
        window.location.replace('/login');
      }
    }
  }
}

/**
 * API Client with automatic cookie-based authentication
 * Directly using BaseApiClient methods
 */
export class ApiClient {
  // Tasks API
  static async getTasks() {
    return BaseApiClient.get('/api/tasks');
  }

  static async createTask(task: any) {
    return BaseApiClient.post('/api/tasks', task);
  }

  static async updateTask(taskId: string, task: any) {
    return BaseApiClient.put(`/api/tasks/${taskId}`, task);
  }

  static async deleteTask(taskId: string) {
    return BaseApiClient.delete(`/api/tasks/${taskId}`);
  }

  // Projects API
  static async getProjects() {
    return BaseApiClient.get('/api/projects');
  }

  static async createProject(project: any) {
    return BaseApiClient.post('/api/projects', project);
  }

  static async updateProject(projectId: string, project: any) {
    return BaseApiClient.put(`/api/projects/${projectId}`, project);
  }

  static async deleteProject(projectId: string) {
    return BaseApiClient.delete(`/api/projects/${projectId}`);
  }

  // User API
  static async getUserProfile() {
    return BaseApiClient.get('/api/users/me');
  }

  static async updateUserProfile(profile: any) {
    return BaseApiClient.put('/api/users/me', profile);
  }

  // Teams API
  static async getTeams() {
    return BaseApiClient.get('/api/teams');
  }

  static async createTeam(team: any) {
    return BaseApiClient.post('/api/teams', team);
  }
}

// Export for backward compatibility
export { AuthService as default };
