import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")

  console.log("[ResetPassword Callback] Handling callback:", { 
    hasCode: !!code,
    error,
    errorCode 
  })

  // If there's an error, redirect to reset-password page with error
  if (error || errorCode) {
    const redirectUrl = new URL("/auth/reset-password", requestUrl.origin)
    redirectUrl.searchParams.set("error", error || "unknown")
    if (errorCode) redirectUrl.searchParams.set("error_code", errorCode)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a code, exchange it for a session
  if (code) {
    try {
      const supabase = await createClient()
      console.log("[ResetPassword Callback] Exchanging code for session...")
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("[ResetPassword Callback] Error exchanging code:", exchangeError)
        const redirectUrl = new URL("/auth/reset-password", requestUrl.origin)
        redirectUrl.searchParams.set("error", "exchange_failed")
        redirectUrl.searchParams.set("error_code", exchangeError.code || "unknown")
        redirectUrl.searchParams.set("error_message", exchangeError.message || "Failed to verify reset link")
        return NextResponse.redirect(redirectUrl)
      }
      
      if (data.session) {
        console.log("[ResetPassword Callback] Session created successfully, redirecting to reset-password page")
        // Redirect to reset-password page - user is now authenticated and can reset password
        return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin))
      } else {
        console.error("[ResetPassword Callback] No session created from code")
        const redirectUrl = new URL("/auth/reset-password", requestUrl.origin)
        redirectUrl.searchParams.set("error", "no_session")
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("[ResetPassword Callback] Error handling code:", error)
      const redirectUrl = new URL("/auth/reset-password", requestUrl.origin)
      redirectUrl.searchParams.set("error", "unknown_error")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code, redirect to reset-password page (user might already be authenticated)
  return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin))
}

