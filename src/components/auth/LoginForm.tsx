"use client"

import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import { LIGHT_THEME } from '@/constants/theme'
import { useAuth } from '@/components/auth/AuthProvider'

// TaskFlow Logo Component
const TaskFlowLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9.5" cy="12.5" r="6.5" fill="#3b82f6"/>
    <circle cx="22.5" cy="12.5" r="6.5" fill="#3b82f6"/>
    <circle cx="16" cy="22.5" r="6.5" fill="#3b82f6"/>
  </svg>
)

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)

      // Sử dụng AuthService mới thay vì NextAuth
      await login()
    } catch (error) {
      console.error("Google sign-in failed:", error)
      setError("Đăng nhập thất bại. Vui lòng thử lại.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* TaskFlow Logo */}
      <div className="flex justify-center py-4">
        <TaskFlowLogo />
      </div>

      {/* Welcome Text */}
      <div className="text-center">
        <h1 
          className="text-2xl font-normal"
          style={{ color: LIGHT_THEME.text.primary }}
        >
          Welcome to TaskFlow
        </h1>
        <p 
          className="text-sm mt-2"
          style={{ color: LIGHT_THEME.text.weak }}
        >
          To get started, please sign in
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        className="w-full h-12 font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: LIGHT_THEME.button.secondary.background,
          borderColor: LIGHT_THEME.button.secondary.border,
          color: LIGHT_THEME.text.primary
        }}
        onMouseEnter={(e) => {
          if (!isGoogleLoading) {
            e.currentTarget.style.backgroundColor = LIGHT_THEME.button.secondary.hover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isGoogleLoading) {
            e.currentTarget.style.backgroundColor = LIGHT_THEME.button.secondary.background;
          }
        }}
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        ) : (
          <FcGoogle className="mr-3 h-5 w-5" />
        )}
        Continue with Google
      </button>

      {/* Footer Links */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs px-4"
             style={{ color: LIGHT_THEME.text.weak }}>
          <a href="#" style={{ color: LIGHT_THEME.text.secondary }} className="hover:underline">TaskFlow.com</a>
          <span>•</span>
          <a href="#" style={{ color: LIGHT_THEME.text.secondary }} className="hover:underline">Support</a>
          <span>•</span>
          <a href="#" style={{ color: LIGHT_THEME.text.secondary }} className="hover:underline">Integrations</a>
          <span>•</span>
          <a href="#" style={{ color: LIGHT_THEME.text.secondary }} className="hover:underline">Forum</a>
          <span>•</span>
          <a href="#" style={{ color: LIGHT_THEME.text.secondary }} className="hover:underline">Developers & API</a>
        </div>
      </div>
    </div>
  )
}