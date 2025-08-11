"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      
      // Use backend OAuth flow
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      console.log('Redirecting to backend OAuth:', `${apiUrl}/api/auth/google/url`)
      
      // Get Google OAuth URL from backend
      const response = await fetch(`${apiUrl}/api/auth/google/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get Google OAuth URL: ${response.status}`)
      }
      
      const responseData = await response.json()
      const { authUrl } = responseData
      
      if (!authUrl) {
        throw new Error('No authUrl received from backend')
      }
      
      // Redirect to Google OAuth via backend
      window.location.href = authUrl
    } catch (error) {
      console.error("Google OAuth initialization failed:", error)
      
      // Fallback: Direct redirect to backend OAuth endpoint
      const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/google`
      console.log('Fallback redirect to:', fallbackUrl)
      window.location.href = fallbackUrl
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Secure Authentication
            </span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}