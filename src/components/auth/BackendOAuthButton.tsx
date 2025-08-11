"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"

interface BackendOAuthButtonProps {
  provider: "google"
  children?: React.ReactNode
  className?: string
}

export function BackendOAuthButton({ 
  provider, 
  children, 
  className 
}: BackendOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthLogin = async () => {
    try {
      setIsLoading(true)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      if (provider === "google") {
        // Try to get OAuth URL from backend first
        try {
          const response = await fetch(`${apiUrl}/api/auth/google/url`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            cache: 'no-cache',
          })
          
          if (response.ok) {
            const { authUrl } = await response.json()
            if (authUrl) {
              window.location.href = authUrl
              return
            }
          }
        } catch (error) {
          console.warn('Failed to get OAuth URL from backend:', error)
        }
        
        // Fallback: Direct redirect to backend OAuth endpoint
        window.location.href = `${apiUrl}/api/auth/google`
      }
    } catch (error) {
      console.error("OAuth initialization failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleOAuthLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FcGoogle className="mr-2 h-4 w-4" />
      )}
      {children || "Continue with Google"}
    </Button>
  )
}