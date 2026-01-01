import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tasks, error } = await supabase.from("tasks").select("*").eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error fetching tasks:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and organize your tasks</p>
        </div>
        <CreateTaskDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </CreateTaskDialog>
      </div>
      <TaskList initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
