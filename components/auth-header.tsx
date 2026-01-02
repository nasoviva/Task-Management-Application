import { Pencil } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { texts } from "@/lib/constants/texts"

export function AuthHeader() {
  return (
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
  )
}

