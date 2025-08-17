import NextAuth from "next-auth"
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
    // Use Credentials provider to handle backend OAuth tokens
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
    error: "/error", // Updated to match route structure
  },

  callbacks: {
    async signIn({ user, account, profile }: { 
      user: User | AdapterUser; 
      account?: Account | null; 
      profile?: Profile; 
    }) {
      return true
    },

    async jwt({ token, user, account }: { 
      token: JWT; 
      user?: User | AdapterUser; 
      account?: Account | null; 
    }) {
      if (user) {
        token.id = user.id
        token.role = (user as User).role
        token.permissions = (user as User).permissions
        token.accessToken = (user as User).accessToken
      }
      return token
    },

    async session({ session, token }: { 
      session: any; 
      token: JWT; 
    }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions
        session.user.accessToken = token.accessToken
      }
      return session
    },

    async redirect({ url, baseUrl }: { 
      url: string; 
      baseUrl: string; 
    }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/home"
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