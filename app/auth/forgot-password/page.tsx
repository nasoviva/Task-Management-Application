"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Footer } from "@/components/footer"
import { AuthHeader } from "@/components/auth-header"
import { texts } from "@/lib/constants/texts"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[ForgotPassword] Starting password reset request for email:", email)
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      console.log("[ForgotPassword] Creating Supabase client...")
      const supabase = createClient()
      console.log("[ForgotPassword] Supabase client created successfully")

      // Use the full URL for redirect, ensuring it's properly formatted
      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/auth/reset-password`
        : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`
      
      console.log("[ForgotPassword] Attempting to send reset email with redirect URL:", redirectUrl)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        console.error("[ForgotPassword] Password reset error:", error)
        console.error("[ForgotPassword] Error details:", {
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
          errorMessage = "Redirect URL is not configured. Please add this URL to your Supabase project's allowed redirect URLs: " + redirectUrl
        }

        throw new Error(errorMessage)
      }

      console.log("[ForgotPassword] Password reset email sent successfully")
      setIsSuccess(true)
    } catch (error: unknown) {
      console.error("[ForgotPassword] Password reset failed:", error)

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
      <AuthHeader />
      <div className="flex flex-1 w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{texts.auth.resetPasswordTitle}</CardTitle>
              <CardDescription>{texts.auth.resetPasswordDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    {texts.auth.resetLinkSentDescription}
                  </div>
                  <Link href="/auth/login">
                    <Button className="w-full" variant="outline">
                      {texts.auth.returnToSignIn}
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
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
                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? texts.auth.sendingResetLink : texts.auth.sendResetLink}
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

