// User Lookup Service - Based on USER_LOOKUP_API_DOCUMENTATION.md
// Uses BaseApiClient for consistent HTTP handling

import { BaseApiClient } from '@/lib/baseApiClient';
import {
  UserLookupDto,
  BulkLookupResponse,
  EmailValidationResponse,
  UserSearchResult,
  SingleLookupResult
} from '@/types/user-lookup';

export class UserLookupService {
  private static readonly BASE_PATH = '/api/user-profiles';

  /**
   * 🔍 Single Email Lookup
   * GET /api/user-profiles/lookup?email={email}
   * Use Cases: Invite team members, share permissions, form validation
   */
  static async lookupUser(email: string): Promise<SingleLookupResult> {
    try {
      const user = await BaseApiClient.get<UserLookupDto>(
        `${this.BASE_PATH}/lookup`,
        { email }
      );
      return { exists: true, user };
    } catch (error: any) {
      // 404 means user not found, which is expected behavior
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return { exists: false, email };
      }
      throw error;
    }
  }

  /**
   * 🔍 User Search Autocomplete
   * GET /api/user-profiles/search?q={query}&limit={limit}
   * Use Cases: Assign task, mention user, find team members
   */
  static async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      return await BaseApiClient.get<UserSearchResult[]>(
        `${this.BASE_PATH}/search`,
        { q: query, limit }
      );
    } catch (error) {
      console.error('User search failed:', error);
      return [];
    }
  }

  /**
   * 📦 Bulk Email Lookup
   * POST /api/user-profiles/lookup/bulk
   * Use Cases: Team invitations, share with multiple users
   */
  static async bulkLookupUsers(emails: string[]): Promise<BulkLookupResponse | null> {
    if (!emails || emails.length === 0) {
      return {
        existingUsers: [],
        nonExistentEmails: [],
        totalRequested: 0,
        foundCount: 0,
        notFoundCount: 0
      };
    }

    try {
      return await BaseApiClient.post<BulkLookupResponse>(
        `${this.BASE_PATH}/lookup/bulk`,
        emails
      );
    } catch (error) {
      console.error('Bulk lookup failed:', error);
      return null;
    }
  }

  /**
   * ✅ Email Validation
   * GET /api/user-profiles/validate/email?email={email}
   * Use Cases: Registration form, forgot password validation
   * Note: No authentication required for this endpoint
   */
  static async validateEmail(email: string): Promise<EmailValidationResponse | null> {
    if (!email) {
      return null;
    }

    try {
      return await BaseApiClient.get<EmailValidationResponse>(
        `${this.BASE_PATH}/validate/email`,
        { email }
      );
    } catch (error) {
      console.error('Email validation failed:', error);
      return null;
    }
  }

  /**
   * Helper: Check if email format is valid
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper: Get display name from user object
   */
  static getDisplayName(user: UserLookupDto): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.email;
  }

  /**
   * Helper: Get initials for avatar fallback
   */
  static getInitials(user: UserLookupDto): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  }

  /**
   * Helper: Parse comma-separated emails from textarea input
   */
  static parseEmailsFromText(text: string): string[] {
    return text
      .split(/[,\n\r]+/)
      .map(email => email.trim())
      .filter(email => email && this.isValidEmail(email));
  }

  /**
   * Helper: Debounced search function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Helper: Create debounced search function
   */
  static createDebouncedSearch(delay: number = 300) {
    return this.debounce(this.searchUsers.bind(this), delay);
  }
}

export default UserLookupService;
