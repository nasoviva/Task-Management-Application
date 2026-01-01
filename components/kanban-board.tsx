"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Calendar, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
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

interface KanbanBoardProps {
  initialTasks: Task[]
  userId: string
}

export function KanbanBoard({ initialTasks, userId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const columns: { status: "todo" | "in-progress" | "done"; title: string; color: string }[] = [
    { status: "todo", title: "To Do", color: "bg-secondary" },
    { status: "in-progress", title: "In Progress", color: "bg-primary" },
    { status: "done", title: "Done", color: "bg-muted" },
  ]

  const getTasksByStatus = (status: "todo" | "in-progress" | "done") => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStatus: "todo" | "in-progress" | "done") => {
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggedTask.id)
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Error updating task status:", error)
      return
    }

    setTasks(tasks.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)))
    setDraggedTask(null)
    router.refresh()
  }

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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)
        return (
          <div key={column.status} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                <h2 className="text-lg font-semibold">{column.title}</h2>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              <CreateTaskDialog>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </CreateTaskDialog>
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
                        <h3 className="font-medium leading-tight">{task.title}</h3>
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
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {formatDistance(new Date(task.due_date), new Date(), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
