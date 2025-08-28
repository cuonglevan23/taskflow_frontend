import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import type { User, Account, Profile } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import type { JWT } from "next-auth/jwt"
import { UserRole, ROLE_PERMISSIONS, type Permission } from "@/constants/auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      permissions: Permission[]
      accessToken?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    permissions: Permission[]
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    permissions: Permission[]
    accessToken?: string
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    // Google OAuth Provider - primary authentication method
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Legacy credentials provider for backward compatibility
    CredentialsProvider({
      id: "backend-oauth",
      name: "Backend OAuth",
      credentials: {
        token: { label: "Access Token", type: "text" },
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" },
        avatar: { label: "Avatar", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !credentials?.email) {
          return null
        }

        // Skip backend verification for now since we don't have /api/user/me endpoint
        // In production, you would verify the token with your backend here
        
        // Map credentials to NextAuth user
        const role = (credentials.role as UserRole) || UserRole.MEMBER

        // Fallback: create user from credentials
        return {
          id: credentials.email as string,
          email: credentials.email as string,
          name: (credentials.name as string) || (credentials.email as string),
          image: (credentials.avatar as string) || null,
          role: role,
          permissions: ROLE_PERMISSIONS[role] || [],
          accessToken: credentials.token as string,
        }
      },
    }),
  ],
  
  pages: {
    signIn: "/login",
    error: "/error",
  },

  callbacks: {
    async signIn({ user, account, profile }: { 
      user: User | AdapterUser; 
      account?: Account | null; 
      profile?: Profile; 
    }) {
      // Đơn giản chỉ cho phép Google sign-in mà không gọi backend
      if (account?.provider === "google") {
        console.log('✅ Google sign-in cho phép:', profile?.email);
        return true; // Luôn cho phép Google sign-in
      }
      return true;
    },

    async jwt({ token, user, account, profile }: {
      token: JWT;
      user?: User | AdapterUser; 
      account?: Account | null; 
      profile?: Profile | null;
    }) {
      if (account?.provider === "google" && profile) {
        // Gọi backend OAuth endpoint thật dựa trên cấu hình backend
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

          // Gọi endpoint Google OAuth callback của backend
          const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: account.access_token, // Google access token
              id_token: account.id_token,
              profile: {
                id: profile.sub || profile.id,
                email: profile.email,
                name: profile.name,
                picture: profile.picture || profile.image,
                given_name: profile.given_name,
                family_name: profile.family_name,
              }
            }),
          });

          if (response.ok) {
            const backendData = await response.json();
            console.log('✅ Backend OAuth thành công:', backendData);

            // Sử dụng JWT token từ backend
            token.id = backendData.user?.id || profile.email!;
            token.role = backendData.user?.role || UserRole.MEMBER;
            token.permissions = ROLE_PERMISSIONS[backendData.user?.role || UserRole.MEMBER];
            token.accessToken = backendData.accessToken || backendData.access_token;

            return token;
          } else {
            const errorText = await response.text();
            console.warn('Backend OAuth failed:', response.status, errorText);
          }
        } catch (error) {
          console.warn('Backend OAuth error:', error);
        }

        // Fallback: Tạo token tạm thời cho development
        console.log('🔧 Using development fallback token for:', profile.email);
        token.id = profile.email!;
        token.role = UserRole.MEMBER;
        token.permissions = ROLE_PERMISSIONS[UserRole.MEMBER];

        // Tạo JWT token format giống backend
        const payload = {
          sub: profile.email,
          email: profile.email,
          name: profile.name,
          role: 'MEMBER',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (72000000 / 1000) // 72000000ms = 72000s
        };

        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(payload)).toString('base64')}.dev_signature`;
        token.accessToken = mockToken;

      } else if (user) {
        // Handle credentials login
        token.id = user.id;
        token.role = (user as User).role;
        token.permissions = (user as User).permissions;
        token.accessToken = (user as User).accessToken;
      }
      return token;
    },

    async session({ session, token }: { 
      session: any; 
      token: JWT; 
    }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },

    async redirect({ url, baseUrl }: { 
      url: string; 
      baseUrl: string; 
    }) {
      // Simple redirect logic - always go to home after successful auth
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/home";
    },
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours instead of every request
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signOut(message) {
      if ('token' in message && message.token) {
        console.log("User signed out:", message.token.email)
      }
    },
  },

  debug: false, // Disable debug to reduce console logs
  
  // Reduce unnecessary session updates
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
}

export const {
  handlers,
  auth,
  signIn,
  signOut
} = NextAuth(authOptions)

export default NextAuth(authOptions)