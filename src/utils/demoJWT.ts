// Demo JWT Token Generator - For Development Only
import { UserWithRole, UserRole } from '@/types/roles';

// Demo JWT secret (only for development)
const DEMO_JWT_SECRET = 'demo-secret-key-for-development-only-do-not-use-in-production';

// Simple base64 URL encode/decode functions
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  // Add padding if needed
  str += '='.repeat((4 - str.length % 4) % 4);
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(str);
}

// Simple HMAC SHA256 simulation (for demo purposes only)
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = new Uint8Array(signature);
  const signatureString = String.fromCharCode(...signatureArray);
  
  return base64UrlEncode(signatureString);
}

interface JWTPayload {
  sub: string; // user id
  email?: string;
  name?: string;
  role?: UserRole;
  type?: string; // token type (access/refresh)
  iat: number; // issued at
  exp: number; // expires at
  projectRoles?: Record<string, UserRole>;
}

export class DemoJWTService {
  // Generate demo access token
  static async generateAccessToken(user: UserWithRole): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      projectRoles: user.projectRoles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    
    const signature = await createSignature(data, DEMO_JWT_SECRET);
    
    return `${data}.${signature}`;
  }

  // Generate demo refresh token
  static async generateRefreshToken(user: UserWithRole): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    
    const signature = await createSignature(data, DEMO_JWT_SECRET);
    
    return `${data}.${signature}`;
  }

  // Verify and decode token (simplified for demo)
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerPart, payloadPart, signaturePart] = parts;
      const data = `${headerPart}.${payloadPart}`;
      
      // Verify signature
      const expectedSignature = await createSignature(data, DEMO_JWT_SECRET);
      if (expectedSignature !== signaturePart) {
        console.error('Token signature verification failed');
        return null;
      }

      // Decode payload
      const payload = JSON.parse(base64UrlDecode(payloadPart)) as JWTPayload;
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.error('Token expired');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
      if (!payload || !payload.exp) return true;
      
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  // Get token payload without verification (for demo purposes)
  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      return JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Generate token pair (access + refresh)
  static async generateTokenPair(user: UserWithRole) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      tokenType: 'Bearer'
    };
  }

  // Simulate token refresh
  static async refreshAccessToken(refreshToken: string, user: UserWithRole): Promise<{ accessToken: string; expiresIn: number } | null> {
    const decoded = await this.verifyToken(refreshToken);
    
    if (!decoded || decoded.type !== 'refresh') {
      return null;
    }

    return {
      accessToken: await this.generateAccessToken(user),
      expiresIn: 3600
    };
  }
}

// Demo token storage utilities
export class DemoTokenStorage {
  private static ACCESS_TOKEN_KEY = 'demo_access_token';
  private static REFRESH_TOKEN_KEY = 'demo_refresh_token';
  private static TOKEN_EXPIRES_KEY = 'demo_token_expires_at';

  static storeTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    // Store in localStorage
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, (Date.now() + expiresIn * 1000).toString());
    
    // Also store in cookies for middleware access
    const expirationDate = new Date(Date.now() + expiresIn * 1000);
    document.cookie = `access_token=${accessToken}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `refresh_token=${refreshToken}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; SameSite=Lax`;
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  static clearTokens() {
    // Clear localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    localStorage.removeItem('mock_auth_user');
    
    // Clear cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('🧹 All tokens and auth data cleared');
  }

  // Manual clear function for debugging
  static forceLogout() {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('🔥 FORCE LOGOUT: All data cleared. Please refresh the page.');
    window.location.href = '/login';
  }

  static getTokenInfo() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isExpired: this.isTokenExpired(),
      expiresAt: expiresAt ? new Date(parseInt(expiresAt)) : null,
      accessTokenPayload: accessToken ? DemoJWTService.decodeToken(accessToken) : null,
      refreshTokenPayload: refreshToken ? DemoJWTService.decodeToken(refreshToken) : null,
    };
  }
}

// Make forceLogout globally available for debugging
if (typeof window !== 'undefined') {
  (window as unknown as Window & { forceLogout: () => void }).forceLogout = DemoTokenStorage.forceLogout;
  console.log('🔧 Debug: Use forceLogout() in console to clear all auth data');
}