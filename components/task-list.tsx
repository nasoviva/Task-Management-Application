"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Pencil, Calendar, Search, Filter, ArrowUpDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { formatDistance } from "date-fns"

interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in-progress" | "done"
  due_date: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}

interface TaskListProps {
  initialTasks: Task[]
  userId: string
}

export function TaskList({ initialTasks, userId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("created-desc")
  const supabase = createClient()
  const router = useRouter()

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done"

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error updating task:", error)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: currentStatus } : task)))
      return
    }

    router.refresh()
  }

  const handleDelete = async (taskId: string) => {
    const deletedTask = tasks.find((task) => task.id === taskId)
    setTasks(tasks.filter((task) => task.id !== taskId))

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting task:", error)
      if (deletedTask) {
        setTasks([...tasks, deletedTask])
      }
      return
    }

    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "secondary"
      case "in-progress":
        return "default"
      case "done":
        return "outline"
      default:
        return "secondary"
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

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">Newest First</SelectItem>
                <SelectItem value="created-asc">Oldest First</SelectItem>
                <SelectItem value="due-asc">Due Date (Earliest)</SelectItem>
                <SelectItem value="due-desc">Due Date (Latest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filteredAndSortedTasks.length === 0 && tasks.length > 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No tasks match your filters. Try adjusting your search or filters.
          </p>
        </Card>
      ) : filteredAndSortedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">No tasks yet. Create your first task to get started!</p>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
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
                      <Badge variant={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {formatDistance(new Date(task.due_date), new Date(), { addSuffix: true })}
                        </div>
                      )}
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
