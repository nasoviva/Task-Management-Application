"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AuthHeader } from "@/components/auth-header"
import { texts } from "@/lib/constants/texts"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Handle email verification code from URL
    const handleVerificationCode = async () => {
      const supabase = createClient()
      
      // Check for errors in URL first (from Supabase redirect or API route)
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get("error")
      const errorCode = urlParams.get("error_code")
      const errorDescription = urlParams.get("error_description")
      
      // Also check hash for errors (Supabase sometimes puts errors in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get("error")
      const hashErrorCode = hashParams.get("error_code")
      const hashErrorDescription = hashParams.get("error_description")

      // Handle errors from Supabase redirect or API route
      // Check if there's actually an error (not null, undefined, or empty strings)
      const hasQueryError = errorParam && typeof errorParam === 'string' && errorParam.trim() !== ""
      const hasHashError = hashError && typeof hashError === 'string' && hashError.trim() !== ""
      const hasError = hasQueryError || hasHashError
      
      if (hasError) {
        const finalError = hashError || errorParam
        const finalErrorCode = hashErrorCode || errorCode
        const finalErrorDescription = hashErrorDescription || errorDescription
        
        // Log error details
        console.error("[VerifyEmail] Error in URL:", { 
          error: finalError,
          errorCode: finalErrorCode,
          errorDescription: finalErrorDescription,
          source: hasQueryError ? "query" : "hash"
        })
        
        let errorMessage = "Invalid or expired verification link. Please request a new verification email."
        
        if (finalErrorCode === "otp_expired") {
          errorMessage = "This verification link has expired. Please request a new verification email."
        } else if (finalError === "access_denied" || finalErrorCode === "access_denied") {
          errorMessage = "Access denied. The verification link is invalid or has expired. Please request a new verification email."
        } else if (finalErrorCode === "exchange_failed" || finalError === "exchange_failed") {
          errorMessage = "Failed to verify email. The verification link may have expired. Please request a new verification email."
        } else if (finalErrorCode === "no_session" || finalError === "no_session") {
          errorMessage = "Failed to create session. Please try again or request a new verification email."
        }
        
        setError(errorMessage)
        setIsVerifying(false)
        
        // Clear error from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
      
      // Check for code in query parameters (code-based flow)
      const code = urlParams.get("code")
      
      // Check for tokens in hash (token-based flow)
      const accessToken = hashParams.get("access_token")
      const type = hashParams.get("type")
      const refreshToken = hashParams.get("refresh_token")

      console.log("[VerifyEmail] Checking URL parameters:", { 
        hasCode: !!code,
        hasAccessToken: !!accessToken, 
        type,
        hasRefreshToken: !!refreshToken 
      })

      // Handle code-based flow (most common)
      // Try to exchange code on client first (PKCE code verifier should be in browser cookies)
      if (code) {
        setIsVerifying(true)
        try {
          console.log("[VerifyEmail] Code found, attempting to exchange on client...")
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("[VerifyEmail] Error exchanging code on client:", exchangeError)
            
            // If PKCE error, try API route as fallback
            if (exchangeError.message?.includes("PKCE") || exchangeError.message?.includes("code verifier")) {
              console.log("[VerifyEmail] PKCE error detected, trying API route as fallback...")
              window.location.href = `/api/auth/verify-email?code=${encodeURIComponent(code)}`
              return
            }
            
            setError("Invalid or expired verification link. Please request a new verification email.")
            setIsVerifying(false)
            return
          }
          
          if (data.session) {
            console.log("[VerifyEmail] Email verified successfully, session created")
            setIsVerified(true)
            // Clear the code from URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard")
              router.refresh()
            }, 2000)
          } else {
            console.error("[VerifyEmail] No session created from code")
            setError("Failed to verify email. Please try again.")
          }
        } catch (error) {
          console.error("[VerifyEmail] Error handling code:", error)
          // Try API route as fallback
          console.log("[VerifyEmail] Exception occurred, trying API route as fallback...")
          window.location.href = `/api/auth/verify-email?code=${encodeURIComponent(code)}`
          return
        } finally {
          setIsVerifying(false)
        }
        return
      }
      
      // Note: Errors from API route handler are already handled above in the error checking section

      // Handle token-based flow (fallback)
      if (accessToken && type === "signup" && refreshToken) {
        setIsVerifying(true)
        try {
          console.log("[VerifyEmail] Setting session from tokens...")
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("[VerifyEmail] Error setting session:", sessionError)
            setError("Invalid or expired verification link. Please request a new verification email.")
            setIsVerifying(false)
            return
          }

          console.log("[VerifyEmail] Email verified successfully, session set")
          setIsVerified(true)
          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard")
            router.refresh()
          }, 2000)
        } catch (error) {
          console.error("[VerifyEmail] Error handling verification token:", error)
          setError("An error occurred while verifying your email. Please try again.")
        } finally {
          setIsVerifying(false)
        }
        return
      }

      // If no code or token, check if user is already authenticated (already verified)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("[VerifyEmail] User is already authenticated")
        setIsVerified(true)
      }
    }

    handleVerificationCode()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex flex-1 w-full items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isVerified ? "Email Verified!" : isVerifying ? "Verifying..." : texts.auth.checkEmail}
              </CardTitle>
              <CardDescription>
                {isVerified 
                  ? "Your email has been verified successfully. Redirecting to dashboard..."
                  : isVerifying
                    ? "Please wait while we verify your email..."
                    : texts.auth.emailVerificationDescription
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {error ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      {texts.auth.returnToSignIn}
                    </Button>
                  </Link>
                </div>
              ) : isVerified ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    Your email has been verified! You will be redirected to the dashboard shortly.
                  </div>
                  <Link href="/dashboard">
                    <Button className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {texts.auth.emailVerificationMessage}
                  </p>
                  <Link
                    href="/auth/login"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {texts.auth.returnToSignIn}
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
