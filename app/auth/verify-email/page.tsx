import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex flex-1 w-full items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>We&apos;ve sent you a verification link to confirm your email address</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click the link in the email to complete your registration and start managing your tasks.
              </p>
              <Link
                href="/auth/login"
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Return to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
