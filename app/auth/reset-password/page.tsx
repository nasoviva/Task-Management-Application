"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import { AuthHeader } from "@/components/auth-header"
import { texts } from "@/lib/constants/texts"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase can send reset token in two ways:
    // 1. Code-based flow: URL query parameter ?code=...
    // 2. Token-based flow: URL hash #access_token=...
    const handleResetToken = async () => {
      const supabase = createClient()
      
      // Check for code in query parameters (code-based flow)
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      
      // Check for tokens in hash (token-based flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const type = hashParams.get("type")
      const refreshToken = hashParams.get("refresh_token")

      console.log("[ResetPassword] Checking URL parameters:", { 
        hasCode: !!code,
        hasAccessToken: !!accessToken, 
        type,
        hasRefreshToken: !!refreshToken 
      })

      // Handle code-based flow (most common)
      // Code is handled by callback route on the server to avoid PKCE code verifier issues
      if (code) {
        console.log("[ResetPassword] Code found, redirecting to callback route for server-side processing")
        window.location.href = `/auth/reset-password-callback?code=${encodeURIComponent(code)}`
        return
      }
      
      // Check for error from callback route
      const routeError = urlParams.get("error")
      const routeErrorCode = urlParams.get("error_code")
      const routeErrorMessage = urlParams.get("error_message")
      
      if (routeError) {
        console.error("[ResetPassword] Error from callback route:", { 
          error: routeError,
          errorCode: routeErrorCode,
          errorMessage: routeErrorMessage
        })
        
        let errorMessage = routeErrorMessage || texts.auth.invalidResetToken
        
        if (routeErrorCode === "exchange_failed" || routeError === "exchange_failed") {
          errorMessage = "Failed to verify reset link. The link may have expired. Please request a new password reset link."
        } else if (routeErrorCode === "no_session" || routeError === "no_session") {
          errorMessage = "Failed to create session. Please try again or request a new password reset link."
        }
        
        setError(errorMessage)
        
        // Clear error from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      // Handle token-based flow (fallback)
      if (accessToken && type === "recovery" && refreshToken) {
        try {
          // Set the session with the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("[ResetPassword] Error setting session:", sessionError)
            setError(texts.auth.invalidResetToken)
          } else {
            console.log("[ResetPassword] Session set successfully, user can now reset password")
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } catch (error) {
          console.error("[ResetPassword] Error handling reset token:", error)
          setError(texts.auth.invalidResetToken)
        }
        return
      }

      // If no code or token, check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error("[ResetPassword] Missing or invalid reset token and user not authenticated")
        setError(texts.auth.invalidResetToken)
      } else {
        console.log("[ResetPassword] User is authenticated, can proceed with password reset")
      }
    }

    handleResetToken()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[ResetPassword] Starting password update process")
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      console.error("[ResetPassword] Password mismatch")
      setError(texts.auth.passwordsDoNotMatch)
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      console.error("[ResetPassword] Password too short")
      setError(texts.auth.passwordTooShort)
      setIsLoading(false)
      return
    }

    try {
      console.log("[ResetPassword] Creating Supabase client...")
      const supabase = createClient()
      console.log("[ResetPassword] Supabase client created successfully")

      console.log("[ResetPassword] Attempting to update password...")
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        console.error("[ResetPassword] Password update error:", error)
        console.error("[ResetPassword] Error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        })

        // Provide more user-friendly error messages
        let errorMessage = error.message
        if (error.message.includes("Invalid API key") || error.message.includes("API key")) {
          errorMessage = "Configuration error: Invalid Supabase API key. Please check your environment variables."
        } else if (error.message.includes("Invalid URL") || error.message.includes("URL")) {
          errorMessage = "Configuration error: Invalid Supabase URL. Please check your environment variables."
        } else if (error.message.includes("requested path is invalid") || error.message.includes("invalid redirect")) {
          errorMessage = "Invalid reset link. Please request a new password reset link."
        } else if (error.message.includes("session") || error.message.includes("token") || error.message.includes("expired")) {
          errorMessage = texts.auth.invalidResetToken
        }

        throw new Error(errorMessage)
      }

      console.log("[ResetPassword] Password updated successfully")
      setIsSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      console.error("[ResetPassword] Password reset failed:", error)

      if (error instanceof Error) {
        // Check if it's a configuration error from createClient
        if (error.message.includes("Missing required environment variables")) {
          setError(
            "Configuration error: Supabase credentials are missing. " +
            "Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
            "See README.md for setup instructions."
          )
        } else {
          setError(error.message)
        }
      } else {
        setError(texts.auth.passwordResetFailed)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex flex-1 w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{texts.auth.resetPassword}</CardTitle>
              <CardDescription>{texts.auth.resetPasswordDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    {texts.auth.passwordResetSuccessDescription}
                  </div>
                  <Link href="/auth/login">
                    <Button className="w-full">
                      {texts.auth.returnToSignIn}
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="password">{texts.auth.newPassword}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={texts.auth.passwordPlaceholder}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">{texts.auth.confirmNewPassword}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder={texts.auth.confirmPasswordPlaceholder}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? texts.auth.updatingPassword : texts.auth.updatePassword}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <Link href="/auth/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                      {texts.auth.returnToSignIn}
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

