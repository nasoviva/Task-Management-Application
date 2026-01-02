"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Pencil, Calendar, Search, Filter, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { format, startOfMonth, endOfMonth } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

interface TimelineViewProps {
  initialTasks: Task[]
  userId: string
}

export function TimelineView({ initialTasks, userId }: TimelineViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const router = useRouter()

  // Sync initialTasks with state when they change (e.g., after router.refresh())
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const handleDelete = async (taskId: string) => {
    console.log("[Timeline] Deleting task:", taskId)
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[Timeline] Error deleting task:", error)
      return
    }

    console.log("[Timeline] Task deleted successfully")
    setTasks(tasks.filter((task) => task.id !== taskId))
    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskCreated = (newTask: Task) => {
    console.log("[Timeline] Adding new task to timeline:", newTask.id)
    setTasks([...tasks, newTask])
  }


  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "complete") {
        filtered = filtered.filter((task) => task.status === "done")
      } else if (statusFilter === "incomplete") {
        filtered = filtered.filter((task) => task.status !== "done")
      } else {
        filtered = filtered.filter((task) => task.status === statusFilter)
      }
    }

    // Search by title or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [tasks, statusFilter, searchQuery])

  const tasksWithDueDate = filteredTasks
    .filter((task) => task.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  const tasksWithoutDueDate = filteredTasks.filter((task) => !task.due_date)

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
      <div className="flex items-center justify-between gap-4">
        <Card className="flex-1 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={texts.tasks.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={texts.tasks.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{texts.tasks.allTasks}</SelectItem>
                  <SelectItem value="todo">{texts.tasks.toDo}</SelectItem>
                  <SelectItem value="in-progress">{texts.tasks.inProgress}</SelectItem>
                  <SelectItem value="done">{texts.tasks.done}</SelectItem>
                  <SelectItem value="complete">{texts.tasks.complete}</SelectItem>
                  <SelectItem value="incomplete">{texts.tasks.incomplete}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        <CreateTaskDialog onTaskCreated={handleTaskCreated}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {texts.tasks.newTask}
          </Button>
        </CreateTaskDialog>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={previousMonth}>
            {texts.tasks.previous}
          </Button>
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" onClick={nextMonth}>
            {texts.tasks.next}
          </Button>
        </div>
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
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h3>
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
                      <Badge className={getStatusColor(task.status, false)}>{getStatusLabel(task.status)}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {texts.tasks.due} {format(dueDate, "MMM d, yyyy")}
                      </div>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {texts.tasks.created} {format(createdDate, "MMM d, yyyy")}
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
            {texts.tasks.noTasksWithDueDates.replace("{month}", format(currentMonth, "MMMM yyyy"))}
          </p>
        </Card>
      )}

      {tasksWithoutDueDate.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{texts.tasks.tasksWithoutDueDates}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {tasksWithoutDueDate.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h3>
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
                    <Badge className={`${getStatusColor(task.status, false)} text-xs`}>
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
