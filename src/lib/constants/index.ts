// Re-export all constants for centralized access
export * from "@/constants/auth"
// export * from "@/constants/routes" // TODO: Create if needed

// App-wide constants
export const APP_NAME = "TaskManager"
export const APP_DESCRIPTION = "Project Management Made Simple"

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
export const FRONTEND_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

// Session Configuration
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
export const JWT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days