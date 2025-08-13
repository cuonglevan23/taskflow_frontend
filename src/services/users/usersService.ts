// Users Service - Centralized user operations using lib/api.ts
import { api } from '@/lib/api';
import { transformUser, transformPaginatedResponse } from '@/lib/transforms';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  teamIds: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role?: string;
  teamIds?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
  teamIds?: string[];
}

// Users Service
export const usersService = {
  // Get all users with pagination and search
  getUsers: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      const {
        page = 0,
        size = 20,
        search,
        role
      } = params || {};

      console.log('🔄 Fetching users...');
      
      const response = await api.get('/api/users', {
        params: { page, size, q: search, role }
      });

      // Handle both paginated and simple array responses
      if (response.data.content) {
        const paginatedResult = transformPaginatedResponse(response.data, transformUser);
        return {
          users: paginatedResult.items,
          totalElements: paginatedResult.totalElements,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          pageSize: paginatedResult.pageSize,
        };
      } else {
        // Simple array response
        const users = response.data.map(transformUser);
        return {
          users,
          totalElements: users.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: users.length,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    try {
      console.log('🔄 Fetching user by ID:', id);
      const response = await api.get(`/api/users/${id}`);
      return transformUser(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('🔄 Fetching current user...');
      const response = await api.get('/api/auth/me');
      return transformUser(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch current user:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (data: CreateUserDTO): Promise<User> => {
    try {
      console.log('🔄 Creating user:', data.email);
      const response = await api.post('/api/users', data);
      return transformUser(response.data);
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDTO): Promise<User> => {
    try {
      console.log('🔄 Updating user:', id);
      const response = await api.put(`/api/users/${id}`, data);
      return transformUser(response.data);
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      console.log('🔄 Deleting user:', id);
      await api.delete(`/api/users/${id}`);
      console.log('✅ Successfully deleted user:', id);
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      console.log('🔄 Searching users:', query);
      const response = await api.get('/api/users/search', {
        params: { q: query }
      });
      return response.data.map(transformUser);
    } catch (error) {
      console.error('❌ Failed to search users:', error);
      throw error;
    }
  },
};