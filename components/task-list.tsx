"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Pencil, Calendar, Search, Filter, ArrowUpDown, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { format } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

interface TaskListProps {
  initialTasks: Task[]
  userId: string
  onCreateTask?: (task: Task) => void
}

export function TaskList({ initialTasks, userId, onCreateTask }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("created-desc")
  const supabase = createClient()
  const router = useRouter()

  // Sync initialTasks with state when they change (e.g., after router.refresh())
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleToggleComplete = async (taskId: string, currentStatus: "todo" | "in-progress" | "done") => {
    const newStatus = currentStatus === "done" ? "todo" : "done"
    console.log("[TaskList] Toggling task", taskId, "from", currentStatus, "to", newStatus)

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[TaskList] Error updating task:", error)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: currentStatus } : task)))
      return
    }

    console.log("[TaskList] Task status toggled successfully")
    router.refresh()
  }

  const handleDelete = async (taskId: string) => {
    console.log("[TaskList] Deleting task:", taskId)
    const deletedTask = tasks.find((task) => task.id === taskId)
    setTasks(tasks.filter((task) => task.id !== taskId))

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[TaskList] Error deleting task:", error)
      if (deletedTask) {
        setTasks([...tasks, deletedTask])
      }
      return
    }

    console.log("[TaskList] Task deleted successfully")
    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskCreated = (newTask: Task) => {
    console.log("[TaskList] Adding new task to list:", newTask.id)
    setTasks([newTask, ...tasks])
    if (onCreateTask) {
      onCreateTask(newTask)
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
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

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "created-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "created-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "due-asc":
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case "due-desc":
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, statusFilter, searchQuery, sortBy])


  return (
    <div className="space-y-4">
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder={texts.tasks.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">{texts.tasks.sortCreatedDesc}</SelectItem>
                <SelectItem value="created-asc">{texts.tasks.sortCreatedAsc}</SelectItem>
                <SelectItem value="due-asc">{texts.tasks.sortDueAsc}</SelectItem>
                <SelectItem value="due-desc">{texts.tasks.sortDueDesc}</SelectItem>
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

      {filteredAndSortedTasks.length === 0 && tasks.length > 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            {texts.tasks.noTasksMatch}
          </p>
        </Card>
      ) : filteredAndSortedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">{texts.tasks.noTasksYet}</p>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {texts.tasks.showingTasks.replace("{count}", filteredAndSortedTasks.length.toString()).replace("{total}", tasks.length.toString())}
          </div>
          <div className="space-y-3">
            {filteredAndSortedTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.title}
                        </h3>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {texts.tasks.due} {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {texts.tasks.created} {format(new Date(task.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
