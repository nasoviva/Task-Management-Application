"use client"

import type React from "react"

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
import { format } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"

interface KanbanBoardProps {
  initialTasks: Task[]
  userId: string
}

export function KanbanBoard({ initialTasks, userId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const router = useRouter()

  // Sync initialTasks with state when they change (e.g., after router.refresh())
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const columns: { status: "todo" | "in-progress" | "done"; title: string }[] = [
    { status: "todo", title: "To Do" },
    { status: "in-progress", title: "In Progress" },
    { status: "done", title: "Done" },
  ]


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

  const getTasksByStatus = (status: "todo" | "in-progress" | "done") => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStatus: "todo" | "in-progress" | "done") => {
    if (!draggedTask || draggedTask.status === newStatus) {
      console.log("[Kanban] Drop cancelled - no task or same status")
      setDraggedTask(null)
      return
    }

    console.log("[Kanban] Moving task", draggedTask.id, "from", draggedTask.status, "to", newStatus)
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggedTask.id)
      .eq("user_id", userId)

    if (error) {
      console.error("[Kanban] Error updating task status:", error)
      return
    }

    console.log("[Kanban] Task status updated successfully")
    setTasks(tasks.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)))
    setDraggedTask(null)
    router.refresh()
  }

  const handleDelete = async (taskId: string) => {
    console.log("[Kanban] Deleting task:", taskId)
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[Kanban] Error deleting task:", error)
      return
    }

    console.log("[Kanban] Task deleted successfully")
    setTasks(tasks.filter((task) => task.id !== taskId))
    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskCreated = (newTask: Task) => {
    console.log("[Kanban] Adding new task to board:", newTask.id)
    setTasks([...tasks, newTask])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Card className="flex-1 p-4">
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
            </div>
          </div>
        </Card>
        <CreateTaskDialog onTaskCreated={handleTaskCreated}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </CreateTaskDialog>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)
        return (
          <div key={column.status} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>
            <div
              className="min-h-[500px] rounded-lg border-2 border-dashed bg-muted/20 p-4 transition-colors hover:border-muted-foreground/50"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move p-4 transition-shadow hover:shadow-md"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium leading-tight ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h3>
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
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {format(new Date(task.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}
