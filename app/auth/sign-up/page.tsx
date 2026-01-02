"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { texts } from "@/lib/constants/texts"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[SignUp] Starting signup process for email:", email)
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      console.error("[SignUp] Password mismatch")
      setError(texts.auth.passwordsDoNotMatch)
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      console.error("[SignUp] Password too short")
      setError(texts.auth.passwordTooShort)
      setIsLoading(false)
      return
    }

    try {
      console.log("[SignUp] Creating Supabase client...")
      const supabase = createClient()
      console.log("[SignUp] Supabase client created successfully")

      const redirectUrl = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`
      console.log("[SignUp] Attempting signup with redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })
      
      if (error) {
        console.error("[SignUp] Signup error:", error)
        console.error("[SignUp] Error details:", {
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
        }
        
        throw new Error(errorMessage)
      }
      
      console.log("[SignUp] Signup successful, user:", data.user?.id)
      console.log("[SignUp] Session:", data.session ? "created" : "not created (email verification required)")
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      console.error("[SignUp] Signup failed:", error)
      
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
        setError(texts.auth.anErrorOccurred)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold">{texts.appName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex flex-1 w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{texts.auth.createAccount}</CardTitle>
              <CardDescription>{texts.auth.signUpDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{texts.auth.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={texts.auth.emailPlaceholder}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{texts.auth.password}</Label>
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
                    <Label htmlFor="confirm-password">{texts.auth.confirmPassword}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder={texts.auth.confirmPasswordPlaceholder}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? texts.auth.creatingAccount : texts.auth.signUp}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {texts.auth.alreadyHaveAccount}{" "}
                  <Link href="/auth/login" className="text-foreground underline underline-offset-4 hover:text-primary">
                    {texts.auth.signIn}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
