// Authentication types
import { UserRole, Permission } from "@/constants/auth"

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
  permissions: string[]
  accessToken?: string
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

export interface AuthCallbackData {
  token: string
  email: string
  name: string
  role: string
  avatar?: string
}

export interface BackendOAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  is_first_login?: boolean
}