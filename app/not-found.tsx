"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AuthHeader } from "@/components/auth-header"
import { texts } from "@/lib/constants/texts"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
            <h2 className="mb-2 text-3xl font-semibold">{texts.notFound.title}</h2>
            <p className="text-muted-foreground">{texts.notFound.description}</p>
          </div>
          <div className="flex items-center justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                {texts.notFound.goHome}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

