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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{texts.tasks.kanbanTitle}</h1>
        <p className="text-muted-foreground">{texts.tasks.kanbanDescription}</p>
      </div>
      <KanbanBoard initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
