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
    const supabase = createClient()
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })
      if (error) {
        console.error("[SignUp] Signup error:", error)
        throw error
      }
      console.log("[SignUp] Signup successful, user:", data.user?.id)
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      console.error("[SignUp] Signup failed:", error)
      setError(error instanceof Error ? error.message : texts.auth.anErrorOccurred)
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
