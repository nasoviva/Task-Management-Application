import { Button } from "@/components/ui/button"
import { Pencil, Calendar, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance">Manage your tasks with ease</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
            Stay organized with powerful task management. View your work in Kanban boards or timeline views. Track
            deadlines and manage your productivity effortlessly.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Everything you need to stay productive</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Pencil className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Task Management</h3>
                <p className="text-muted-foreground">Create, organize, and track your tasks with ease</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Kanban Board</h3>
                <p className="text-muted-foreground">Visualize your workflow with intuitive drag-and-drop boards</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Timeline View</h3>
                <p className="text-muted-foreground">Plan ahead with timeline visualization and due dates</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
