import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")

  console.log("[VerifyEmail API] Handling verification:", { 
    hasCode: !!code,
    error,
    errorCode 
  })

  // If there's an error, redirect to verify-email page with error
  if (error || errorCode) {
    const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
    redirectUrl.searchParams.set("error", error || "unknown")
    if (errorCode) redirectUrl.searchParams.set("error_code", errorCode)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a code, exchange it for a session on the server
  // This ensures PKCE code verifier is available in server-side cookies
  if (code) {
    try {
      const supabase = await createClient()
      console.log("[VerifyEmail API] Exchanging code for session on server...")
      console.log("[VerifyEmail API] Code:", code.substring(0, 20) + "...")
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("[VerifyEmail API] Error exchanging code:", {
          message: exchangeError.message,
          code: exchangeError.code,
          status: exchangeError.status,
          name: exchangeError.name
        })
        
        // If it's a PKCE error, the code verifier might not be in cookies
        // In this case, we should redirect back to client-side handling
        if (exchangeError.message?.includes("PKCE") || exchangeError.message?.includes("code verifier")) {
          console.log("[VerifyEmail API] PKCE error - code verifier not found in cookies")
          const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
          redirectUrl.searchParams.set("code", code)
          redirectUrl.searchParams.set("error", "pkce_missing")
          redirectUrl.searchParams.set("error_message", "Please try clicking the verification link again.")
          return NextResponse.redirect(redirectUrl)
        }
        
        const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
        redirectUrl.searchParams.set("error", "exchange_failed")
        redirectUrl.searchParams.set("error_code", exchangeError.code || "unknown")
        redirectUrl.searchParams.set("error_message", exchangeError.message || "Failed to verify email")
        return NextResponse.redirect(redirectUrl)
      }
      
      if (data.session) {
        console.log("[VerifyEmail API] Email verified successfully, session created")
        // Create response with redirect and set cookies
        const response = NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
        // Cookies should already be set by createClient, but we ensure they're in the response
        return response
      } else {
        console.error("[VerifyEmail API] No session created from code")
        const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
        redirectUrl.searchParams.set("error", "no_session")
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("[VerifyEmail API] Error handling code:", error)
      const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
      redirectUrl.searchParams.set("error", "unknown_error")
      if (error instanceof Error) {
        redirectUrl.searchParams.set("error_message", error.message)
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code, just redirect to verify-email page
  return NextResponse.redirect(new URL("/auth/verify-email", requestUrl.origin))
}


