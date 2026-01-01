import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline-view"

export default async function TimelinePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("[v0] Error fetching tasks:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <p className="text-muted-foreground">Visualize your tasks over time</p>
      </div>
      <TimelineView initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
