import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/kanban-board"
import { texts } from "@/lib/constants/texts"

export default async function KanbanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[KanbanPage] Fetching tasks for user:", user.id)
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[KanbanPage] Error fetching tasks:", error)
  } else {
    console.log("[KanbanPage] Fetched", tasks?.length || 0, "tasks")
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{texts.tasks.kanbanTitle}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{texts.tasks.kanbanDescription}</p>
      </div>
      <KanbanBoard initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
