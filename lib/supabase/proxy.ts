import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from home page to dashboard
  if (request.nextUrl.pathname === "/" && user) {
    console.log("[Middleware] User authenticated, redirecting from home to dashboard")
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except reset-password and verify-email which may need auth)
  if (
    (request.nextUrl.pathname === "/auth/login" || 
     request.nextUrl.pathname === "/auth/sign-up" ||
     request.nextUrl.pathname === "/auth/forgot-password" ||
     request.nextUrl.pathname === "/auth/verify-email") && 
    user
  ) {
    // For verify-email, only redirect if there's no error in the URL (user might be verifying)
    // If there's an error and user is authenticated, redirect to dashboard
    if (request.nextUrl.pathname === "/auth/verify-email") {
      const hasError = request.nextUrl.searchParams.has("error") || 
                       request.nextUrl.searchParams.has("error_code")
      if (hasError) {
        console.log("[Middleware] User authenticated but verify-email has error, redirecting to dashboard")
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
      // If no error, allow the page to handle verification
      return supabaseResponse
    }
    
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
