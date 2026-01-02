import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline-view"
import { texts } from "@/lib/constants/texts"

export default async function TimelinePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[TimelinePage] Fetching tasks for user:", user.id)
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("[TimelinePage] Error fetching tasks:", error)
  } else {
    console.log("[TimelinePage] Fetched", tasks?.length || 0, "tasks")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{texts.tasks.timelineTitle}</h1>
        <p className="text-muted-foreground">{texts.tasks.timelineDescription}</p>
      </div>
      <TimelineView initialTasks={tasks || []} userId={user.id} />
    </div>
  )
}
