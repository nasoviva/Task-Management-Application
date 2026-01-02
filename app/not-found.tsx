"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { texts } from "@/lib/constants/texts"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Pencil className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">{texts.appName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
            <h2 className="mb-2 text-3xl font-semibold">{texts.notFound.title}</h2>
            <p className="text-muted-foreground">{texts.notFound.description}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {texts.notFound.goHome}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {texts.notFound.goBack}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

