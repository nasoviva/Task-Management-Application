import { texts } from "@/lib/constants/texts"

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>{texts.footer.copyright}</p>
      </div>
    </footer>
  )
}

