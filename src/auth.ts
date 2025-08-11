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

export const { handlers, signIn, signOut, auth } = NextAuth({
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


        // Verify token with backend
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${credentials.token}`,
            },
          })

          if (response.ok) {
            const backendUser = await response.json()
            
            // Map backend user to NextAuth user
            const role = (credentials.role as UserRole) || UserRole.MEMBER
            return {
              id: backendUser.id?.toString() || credentials.email,
              email: credentials.email,
              name: credentials.name || backendUser.name,
              image: credentials.avatar || backendUser.avatar,
              role: role,
              permissions: ROLE_PERMISSIONS[role] || [],
              accessToken: credentials.token,
            }
          }
        } catch (error) {
          console.error('Backend user verification failed:', error)
        }

        // Fallback: create user from credentials
        const role = (credentials.role as UserRole) || UserRole.MEMBER
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
      // Allow sign in for backend OAuth users
      return true
    },

    async jwt({ token, user, account }) {
      // Initial sign in - user data comes from backend OAuth
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = user.permissions
        token.accessToken = user.accessToken
      }
      
      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions
        session.user.accessToken = token.accessToken
      }
      
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/home"
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.email)
      // Here you can log sign-ins, update last login time, etc.
    },
    
    async signOut({ token }) {
      console.log("User signed out:", token?.email)
      // Here you can log sign-outs, cleanup sessions, etc.
    },
  },

  debug: process.env.NODE_ENV === "development",
})