import { texts } from "@/lib/constants/texts"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {currentYear} TaskFlow. All rights reserved.</p>
      </div>
    </footer>
  )
}

