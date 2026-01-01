"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { format, startOfMonth, endOfMonth } from "date-fns"

interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  due_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}

interface TimelineViewProps {
  initialTasks: Task[]
  userId: string
}

export function TimelineView({ initialTasks, userId }: TimelineViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()
  const router = useRouter()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const handleDelete = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting task:", error)
      return
    }

    setTasks(tasks.filter((task) => task.id !== taskId))
    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-blue-500"
      case "in-progress":
        return "bg-amber-500"
      case "done":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do"
      case "in-progress":
        return "In Progress"
      case "done":
        return "Done"
      default:
        return status
    }
  }

  const tasksWithDueDate = tasks
    .filter((task) => task.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  const tasksWithoutDueDate = tasks.filter((task) => !task.due_date)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const tasksInMonth = tasksWithDueDate.filter((task) => {
    const dueDate = new Date(task.due_date!)
    return dueDate >= monthStart && dueDate <= monthEnd
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={previousMonth}>
            Previous
          </Button>
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" onClick={nextMonth}>
            Next
          </Button>
        </div>
        <CreateTaskDialog>
          <Button>Add Task</Button>
        </CreateTaskDialog>
      </div>

      {tasksInMonth.length > 0 ? (
        <div className="space-y-4">
          {tasksInMonth.map((task) => {
            const dueDate = new Date(task.due_date!)
            const createdDate = new Date(task.created_at)
            const isOverdue = dueDate < new Date() && task.status !== "done"

            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} userId={userId}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </EditTaskDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due: {format(dueDate, "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {format(createdDate, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No tasks with due dates in {format(currentMonth, "MMMM yyyy")}. Add due dates to your tasks to see them on
            the timeline!
          </p>
        </Card>
      )}

      {tasksWithoutDueDate.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Tasks without due dates</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {tasksWithoutDueDate.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium">{task.title}</h3>
                      <div className="flex items-center gap-1">
                        <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} userId={userId}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </EditTaskDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
