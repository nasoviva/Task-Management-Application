"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
import { format } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

interface KanbanBoardProps {
  initialTasks: Task[]
  userId: string
}

export function KanbanBoard({ initialTasks, userId }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const { tasks, setTasks, handleDelete, handleTaskUpdated, handleTaskCreated } = useTaskActions({
    initialTasks,
    userId,
  })

  const filteredTasks = useTaskFilters(tasks, statusFilter, searchQuery)

  const columns: { status: "todo" | "in-progress" | "done"; title: string }[] = [
    { status: "todo", title: "To Do" },
    { status: "in-progress", title: "In Progress" },
    { status: "done", title: "Done" },
  ]

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
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)))
    setDraggedTask(null)
    router.refresh()
  }


  return (
    <div className="space-y-6">
      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTaskCreated={(task) => handleTaskCreated(task, false)}
      />
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
                        <TaskActions
                          task={task}
                          userId={userId}
                          onTaskUpdated={handleTaskUpdated}
                          onDelete={handleDelete}
                          size="small"
                        />
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
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
