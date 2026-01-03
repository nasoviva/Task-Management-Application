import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/task-list"
import { texts } from "@/lib/constants/texts"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[TasksPage] Fetching tasks for user:", user.id)
  const { data: tasks, error } = await supabase.from("tasks").select("*").eq("user_id", user.id)

  if (error) {
    console.error("[TasksPage] Error fetching tasks:", error)
  } else {
    console.log("[TasksPage] Fetched", tasks?.length || 0, "tasks")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{texts.nav.tasks}</h1>
        <p className="text-muted-foreground">{texts.tasks.description}</p>
      </div>
      <TaskList initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
