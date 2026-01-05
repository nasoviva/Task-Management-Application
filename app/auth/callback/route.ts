import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")

  console.log("[Auth Callback] Handling callback:", { 
    hasCode: !!code,
    error,
    errorCode 
  })

  // If there's an error, check if user is already authenticated
  if (error || errorCode) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is already authenticated, redirect to dashboard
      if (user) {
        console.log("[Auth Callback] User is already authenticated, redirecting to dashboard despite error")
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      }
    } catch (checkError) {
      console.error("[Auth Callback] Error checking user session:", checkError)
    }
    
    // If user is not authenticated, redirect to verify-email page with error
    const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
    redirectUrl.searchParams.set("error", error || "unknown")
    if (errorCode) redirectUrl.searchParams.set("error_code", errorCode)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a code, exchange it for a session
  if (code) {
    try {
      const supabase = await createClient()
      console.log("[Auth Callback] Exchanging code for session...")
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("[Auth Callback] Error exchanging code:", exchangeError)
        const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
        redirectUrl.searchParams.set("error", "exchange_failed")
        redirectUrl.searchParams.set("error_code", exchangeError.code || "unknown")
        redirectUrl.searchParams.set("error_message", exchangeError.message || "Failed to verify email")
        return NextResponse.redirect(redirectUrl)
      }
      
      if (data.session) {
        console.log("[Auth Callback] Session created successfully, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      } else {
        console.error("[Auth Callback] No session created from code")
        const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
        redirectUrl.searchParams.set("error", "no_session")
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("[Auth Callback] Error handling code:", error)
      const redirectUrl = new URL("/auth/verify-email", requestUrl.origin)
      redirectUrl.searchParams.set("error", "unknown_error")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code, redirect to dashboard (user might already be authenticated)
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}

