// Simple Backend-only Authentication Service
// Optimized with flow: Authorization Bearer + Auto Refresh + Retry
import BaseApiClient from './baseApiClient';

// Type definitions for API responses
interface GoogleAuthUrlResponse {
  authUrl: string;
}

interface UserProfileResponse {
  id?: string;
  userId?: string;
  email: string;
  name?: string;
  displayName?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: UserProfileResponse;
}

export class AuthService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  private static _isLoggingOut = false;

  /**
   * Initialize Google login
   * Redirect user to backend OAuth endpoint
   */
  static async loginWithGoogle(): Promise<void> {
    try {
      const fullUrl = `${this.BASE_URL}/api/auth/google/url`;

      try {
        const data = await BaseApiClient.get<GoogleAuthUrlResponse>(fullUrl);

        if (!data?.authUrl) {
          throw new Error('Invalid authentication URL received from server');
        }

        window.location.href = data.authUrl;
      } catch (fetchError) {
        throw fetchError;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  static async checkAuth(): Promise<boolean> {
    try {
      await BaseApiClient.get<UserProfileResponse>('/api/user-profiles/me');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user information from backend
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const data = await BaseApiClient.get<UserProfileResponse>('/api/user-profiles/me');

      return {
        id: data.id || data.userId,
        email: data.email,
        name: data.name || data.displayName,
        role: data.role || 'MEMBER',
        avatar: data.avatar || data.avatarUrl
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Login với credentials (email/password) - sử dụng backend traditional login
   */
  static async loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await BaseApiClient.post<LoginResponse>('/api/auth/login', {
        email,
        password
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout - Clear cookies and client data
   */
  static async logout(): Promise<void> {
    // Prevent multiple simultaneous logout calls
    if (this._isLoggingOut) {
      return;
    }

    this._isLoggingOut = true;

    try {
      // Try calling logout API to clear HTTP-only cookies
      try {
        await BaseApiClient.post('/api/auth/logout');
      } catch (error) {
        // Continue even if logout API fails
      }

      // Clear other app data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        try {
          localStorage.clear();
        } catch (e) {
          // Continue if localStorage is not available
        }

        // Clear sessionStorage
        try {
          sessionStorage.clear();
        } catch (e) {
          // Continue if sessionStorage is not available
        }
      }

    } catch (error) {
      // Log error but don't throw - logout should always succeed on client
    } finally {
      this._isLoggingOut = false;
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
