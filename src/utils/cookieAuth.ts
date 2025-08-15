// Professional Cookie-based Authentication Utilities
export class CookieAuth {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_ROLE_KEY = 'userRole';
  private static readonly USER_ID_KEY = 'userId';
  private static readonly USER_EMAIL_KEY = 'userEmail';
  
  // Set cookie with secure options
  static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // URL encode the value to handle special characters
    const encodedValue = encodeURIComponent(value);
    
    // Secure cookie options
    const cookieOptions = [
      `${name}=${encodedValue}`,
      `expires=${expires.toUTCString()}`,
      'path=/',
      'SameSite=Lax',
      // Note: Secure flag should be added in production (HTTPS)
      // 'Secure'
    ];
    
    document.cookie = cookieOptions.join('; ');
    console.log(`🍪 Set cookie: ${name}`);
  }
  
  // Get cookie value
  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        const value = cookie.substring(nameEQ.length, cookie.length);
        return decodeURIComponent(value);
      }
    }
    return null;
  }
  
  // Delete cookie
  static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    console.log(`🗑️ Deleted cookie: ${name}`);
  }
  
  // Access Token Management
  static setAccessToken(token: string): void {
    this.setCookie(this.ACCESS_TOKEN_KEY, token, 30); // 30 days
  }
  
  static getAccessToken(): string | null {
    return this.getCookie(this.ACCESS_TOKEN_KEY);
  }
  
  static deleteAccessToken(): void {
    this.deleteCookie(this.ACCESS_TOKEN_KEY);
  }
  
  // Refresh Token Management  
  static setRefreshToken(token: string): void {
    this.setCookie(this.REFRESH_TOKEN_KEY, token, 90); // 90 days
  }
  
  static getRefreshToken(): string | null {
    return this.getCookie(this.REFRESH_TOKEN_KEY);
  }
  
  static deleteRefreshToken(): void {
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
  }
  
  // User Info Management
  static setUserInfo(userInfo: {
    id: string;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  }): void {
    this.setCookie(this.USER_ID_KEY, userInfo.id);
    this.setCookie(this.USER_EMAIL_KEY, userInfo.email);
    this.setCookie(this.USER_ROLE_KEY, userInfo.role);
    
    if (userInfo.name) {
      this.setCookie('userName', userInfo.name);
    }
    if (userInfo.avatar) {
      this.setCookie('userAvatar', userInfo.avatar);
    }
  }
  
  static getUserInfo(): {
    id: string | null;
    email: string | null;
    role: string | null;
    name: string | null;
    avatar: string | null;
  } {
    return {
      id: this.getCookie(this.USER_ID_KEY),
      email: this.getCookie(this.USER_EMAIL_KEY),
      role: this.getCookie(this.USER_ROLE_KEY),
      name: this.getCookie('userName'),
      avatar: this.getCookie('userAvatar')
    };
  }
  
  // Clear all authentication data
  static clearAuth(): void {
    console.log('🧹 Clearing all authentication cookies...');
    
    const authCookies = [
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_ROLE_KEY,
      this.USER_ID_KEY,
      this.USER_EMAIL_KEY,
      'userName',
      'userAvatar'
    ];
    
    authCookies.forEach(cookieName => {
      this.deleteCookie(cookieName);
    });
    
    // Also clear localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.warn('🚨 Access token expired');
        this.deleteAccessToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      this.deleteAccessToken();
      return false;
    }
  }
  
  // Get token payload
  static getTokenPayload(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  }
  
  // Debug function
  static debugAuth(): void {
    console.group('🍪 Cookie Authentication Debug');
    
    const token = this.getAccessToken();
    const userInfo = this.getUserInfo();
    const payload = this.getTokenPayload();
    
    console.log('📋 Authentication Status:');
    console.log('  Access Token:', token ? `Present (${token.length} chars)` : 'Missing');
    console.log('  Refresh Token:', this.getRefreshToken() ? 'Present' : 'Missing');
    console.log('  Is Authenticated:', this.isAuthenticated());
    
    console.log('👤 User Info:');
    console.log('  ID:', userInfo.id);
    console.log('  Email:', userInfo.email);
    console.log('  Role:', userInfo.role);
    console.log('  Name:', userInfo.name);
    
    if (payload) {
      console.log('🔍 Token Payload:');
      console.log('  User ID:', payload.userId);
      console.log('  Email:', payload.email);
      console.log('  Roles:', payload.roles);
      console.log('  Expires:', new Date(payload.exp * 1000).toLocaleString());
      console.log('  Is Expired:', payload.exp * 1000 < Date.now());
    }
    
    console.groupEnd();
  }
}