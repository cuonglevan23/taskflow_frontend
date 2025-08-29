// Simple Backend-only Authentication Service
// Sử dụng HTTP-only cookies thay vì localStorage để bảo mật

export class AuthService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  /**
   * Khởi tạo đăng nhập với Google
   * Redirect user đến backend OAuth endpoint
   */
  static async loginWithGoogle(): Promise<void> {
    try {
      console.log('🔑 Initiating Google OAuth login...');

      // Gọi backend để lấy Google auth URL
      const response = await fetch(`${this.BASE_URL}/api/auth/google/url`, {
        method: 'GET',
        credentials: 'include', // Include cookies for CSRF protection
      });

      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }

      const data = await response.json();
      console.log('✅ Got Google auth URL, redirecting...');

      // Redirect user đến Google OAuth
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái authentication
   * Backend sẽ đọc HTTP-only cookie để verify
   */
  static async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/user-profiles/me`, {
        method: 'GET',
        credentials: 'include', // Quan trọng: include cookies
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin user hiện tại từ backend
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/user-profiles/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id || data.userId,
          email: data.email,
          name: data.name || data.displayName,
          role: data.role || 'MEMBER',
          avatar: data.avatar || data.avatarUrl
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Get user info failed:', error);
      return null;
    }
  }

  /**
   * Đăng xuất
   * Backend sẽ clear HTTP-only cookies
   */
  static async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');

      await fetch(`${this.BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies để backend có thể clear
      });

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Luôn redirect về login dù có lỗi
      window.location.href = '/login';
    }
  }

  /**
   * Refresh token (tự động được xử lý bởi browser với HTTP-only cookies)
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  }
}

/**
 * API Client với automatic cookie-based authentication
 * Không cần manual token management
 */
export class ApiClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  /**
   * Base request method với automatic authentication
   */
  private static async request(url: string, options: RequestInit = {}): Promise<Response | undefined> {
    const fullUrl = url.startsWith('http') ? url : `${this.BASE_URL}${url}`;

    try {
      const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include', // Tự động include HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle authentication errors
      if (response.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');

        // Thử refresh token
        const refreshed = await AuthService.refreshToken();
        if (!refreshed) {
          console.log('❌ Refresh failed, redirecting to login');
          window.location.href = '/login';
          return;
        }

        // Retry request với token mới
        console.log('✅ Token refreshed, retrying request');
        return fetch(fullUrl, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Tasks API
  static async getTasks() {
    const response = await this.request('/api/tasks');
    return response?.json();
  }

  static async createTask(task: any) {
    const response = await this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response?.json();
  }

  static async updateTask(taskId: string, task: any) {
    const response = await this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
    return response?.json();
  }

  static async deleteTask(taskId: string) {
    const response = await this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    return response?.ok;
  }

  // Projects API
  static async getProjects() {
    const response = await this.request('/api/projects');
    return response?.json();
  }

  static async createProject(project: any) {
    const response = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response?.json();
  }

  static async updateProject(projectId: string, project: any) {
    const response = await this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
    return response?.json();
  }

  static async deleteProject(projectId: string) {
    const response = await this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    return response?.ok;
  }

  // User API
  static async getUserProfile() {
    const response = await this.request('/api/users/me');
    return response?.json();
  }

  static async updateUserProfile(profile: any) {
    const response = await this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return response?.json();
  }

  // Teams API
  static async getTeams() {
    const response = await this.request('/api/teams');
    return response?.json();
  }

  static async createTeam(team: any) {
    const response = await this.request('/api/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
    return response?.json();
  }
}

// Export cho backward compatibility
export { AuthService as default };
