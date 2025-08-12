import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole, ROLE_PERMISSIONS } from "@/constants/auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      permissions: string[]
      accessToken?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    permissions: string[]
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    permissions: string[]
    accessToken?: string
  }
}

export const authOptions = {
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
          id: credentials.email,
          email: credentials.email,
          name: credentials.name || credentials.email,
          image: credentials.avatar || null,
          role: role,
          permissions: ROLE_PERMISSIONS[role] || [],
          accessToken: credentials.token,
        }
      },
    }),
  ],
  
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = user.permissions
        token.accessToken = user.accessToken
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions
        session.user.accessToken = token.accessToken
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/home"
    },
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signOut({ token }) {
      console.log("User signed out:", token?.email)
    },
  },

  debug: process.env.NODE_ENV === "development",
}

export const {
  handlers,
  auth,
  signIn,
  signOut
} = NextAuth(authOptions)

export default NextAuth(authOptions)