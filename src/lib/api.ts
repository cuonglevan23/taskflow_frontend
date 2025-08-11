// API Configuration and Utilities for Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Google OAuth
  async getGoogleAuthUrl() {
    return this.request('/api/auth/google/url');
  }

  async handleGoogleCallback(code: string, state?: string) {
    return this.request('/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  // Exchange OAuth code for tokens (fallback endpoint)
  async exchangeGoogleCode(code: string, state: string) {
    return this.request('/api/auth/google/exchange', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/user/me');
  }

  async updateProfile(userData: any) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Task endpoints
  async getTasks(projectId?: string) {
    const endpoint = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
    return this.request(endpoint);
  }

  async createTask(taskData: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: any) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request('/api/projects');
  }

  async createProject(projectData: any) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId: string, projectData: any) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();



// Token management
export const tokenManager = {
  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};