"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { TaskDateDisplay } from "@/components/task-date-display"
import { TaskStatusBadge } from "@/components/task-status-badge"
import { TaskTitle } from "@/components/task-title"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
import type { Task } from "@/lib/types/task"
import { texts } from "@/lib/constants/texts"

interface KanbanBoardProps {
  initialTasks: Task[]
  userId: string
}

export function KanbanBoard({ initialTasks, userId }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [touchDraggedTask, setTouchDraggedTask] = useState<Task | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const { tasks, setTasks, handleDelete, handleTaskUpdated, handleTaskCreated } = useTaskActions({
    initialTasks,
    userId,
  })

  const filteredTasks = useTaskFilters(tasks, statusFilter, searchQuery)

  const handleDrop = useCallback(async (newStatus: "todo" | "in-progress" | "done") => {
    const taskToMove = draggedTask || touchDraggedTask
    if (!taskToMove || taskToMove.status === newStatus) {
      console.log("[Kanban] Drop cancelled - no task or same status")
      setDraggedTask(null)
      setTouchDraggedTask(null)
      setTouchStartPos(null)
      setDraggedElement(null)
      return
    }

    console.log("[Kanban] Moving task", taskToMove.id, "from", taskToMove.status, "to", newStatus)
    const oldStatus = taskToMove.status
    
    // Optimistic update - update UI immediately
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskToMove.id ? { ...task, status: newStatus } : task)))
    setDraggedTask(null)
    setTouchDraggedTask(null)
    setTouchStartPos(null)
    setDraggedElement(null)

    // Update in database
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskToMove.id)
      .eq("user_id", userId)

    if (error) {
      console.error("[Kanban] Error updating task status:", error)
      // Rollback on error
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskToMove.id ? { ...task, status: oldStatus } : task)))
      return
    }

    console.log("[Kanban] Task status updated successfully")
    router.refresh()
  }, [draggedTask, touchDraggedTask, setTasks, supabase, userId, router])

  // Global touch event handlers for mobile drag and drop
  useEffect(() => {
    if (!touchDraggedTask || !draggedElement) return

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!touchDraggedTask || !touchStartPos || !draggedElement) return
      
      e.preventDefault()
      const touch = e.touches[0]
      
      // Move the element visually
      const deltaX = touch.clientX - touchStartPos.x
      const deltaY = touch.clientY - touchStartPos.y
      draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      draggedElement.style.zIndex = "1000"
      draggedElement.style.position = "relative"
      
      // Find which column we're over
      const dropZones = document.elementsFromPoint(touch.clientX, touch.clientY)
      const dropZone = dropZones.find((el) => el.getAttribute("data-drop-zone")) as HTMLElement | undefined
      
      // Remove highlight from all drop zones first
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        const htmlZone = zone as HTMLElement
        htmlZone.classList.remove("border-primary", "bg-primary/10")
      })
      
      if (dropZone) {
        dropZone.classList.add("border-primary", "bg-primary/10")
      }
    }

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (!touchDraggedTask || !touchStartPos) return
      
      const touch = e.changedTouches[0]
      const element = draggedElement
      
      // Reset element style
      if (element) {
        element.style.transform = ""
        element.style.opacity = ""
        element.style.zIndex = ""
        element.style.position = ""
      }
      
      // Find which column we're over
      const dropZones = document.elementsFromPoint(touch.clientX, touch.clientY)
      const dropZone = dropZones.find((el) => el.getAttribute("data-drop-zone")) as HTMLElement | undefined
      
      // Remove highlight from all drop zones
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        const htmlZone = zone as HTMLElement
        htmlZone.classList.remove("border-primary", "bg-primary/10")
      })
      
      if (dropZone) {
        const newStatus = dropZone.getAttribute("data-drop-zone") as "todo" | "in-progress" | "done"
        handleDrop(newStatus)
      } else {
        setTouchDraggedTask(null)
        setTouchStartPos(null)
        setDraggedElement(null)
      }
    }

    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
    document.addEventListener("touchend", handleGlobalTouchEnd)

    return () => {
      document.removeEventListener("touchmove", handleGlobalTouchMove)
      document.removeEventListener("touchend", handleGlobalTouchEnd)
    }
  }, [touchDraggedTask, touchStartPos, draggedElement, handleDrop])

  const columns: { status: "todo" | "in-progress" | "done"; title: string }[] = [
    { status: "todo", title: "To Do" },
    { status: "in-progress", title: "In Progress" },
    { status: "done", title: "Done" },
  ]

  const getTasksByStatus = (status: "todo" | "in-progress" | "done") => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleDragStart = (task: Task) => {
    console.log("[Kanban] Drag start:", task.id)
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent, task: Task) => {
    console.log("[Kanban] Touch start:", task.id)
    const touch = e.touches[0]
    const element = e.currentTarget as HTMLElement
    setTouchDraggedTask(task)
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggedElement(element)
    element.style.opacity = "0.5"
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDraggedTask || !touchStartPos || !draggedElement) return
    
    e.preventDefault()
    const touch = e.touches[0]
    
    // Move the element visually
    const deltaX = touch.clientX - touchStartPos.x
    const deltaY = touch.clientY - touchStartPos.y
    draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    draggedElement.style.zIndex = "1000"
    draggedElement.style.position = "relative"
    
    // Find which column we're over
    const dropZones = document.elementsFromPoint(touch.clientX, touch.clientY)
    const dropZone = dropZones.find((el) => el.getAttribute("data-drop-zone")) as HTMLElement | undefined
    
    // Remove highlight from all drop zones first
    document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
      const htmlZone = zone as HTMLElement
      htmlZone.classList.remove("border-primary", "bg-primary/10")
    })
    
    if (dropZone) {
      dropZone.classList.add("border-primary", "bg-primary/10")
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDraggedTask || !touchStartPos) {
      setTouchDraggedTask(null)
      setTouchStartPos(null)
      setDraggedElement(null)
      return
    }
    
    const touch = e.changedTouches[0]
    const element = draggedElement
    
    // Reset element style
    if (element) {
      element.style.transform = ""
      element.style.opacity = ""
      element.style.zIndex = ""
      element.style.position = ""
    }
    
    // Find which column we're over
    const dropZones = document.elementsFromPoint(touch.clientX, touch.clientY)
    const dropZone = dropZones.find((el) => el.getAttribute("data-drop-zone")) as HTMLElement | undefined
    
    // Remove highlight from all drop zones
    document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
      const htmlZone = zone as HTMLElement
      htmlZone.classList.remove("border-primary", "bg-primary/10")
    })
    
    if (dropZone) {
      const newStatus = dropZone.getAttribute("data-drop-zone") as "todo" | "in-progress" | "done"
      handleDrop(newStatus)
    } else {
      setTouchDraggedTask(null)
      setTouchStartPos(null)
      setDraggedElement(null)
    }
  }


  return (
    <div className="space-y-3 md:space-y-6 w-full max-w-full overflow-hidden">
      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTaskCreated={(task) => handleTaskCreated(task, false)}
      />
      <div className="grid gap-3 md:gap-6 md:grid-cols-3 w-full max-w-full">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)
        return (
          <div key={column.status} className="flex flex-col gap-2 md:gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-semibold">{column.title}</h2>
              <Badge variant="secondary" className="text-xs md:text-sm">{columnTasks.length}</Badge>
            </div>
            <div
              className="min-h-[300px] md:min-h-[500px] rounded-lg border-2 border-dashed bg-muted/20 p-2 md:p-4 transition-colors hover:border-muted-foreground/50 w-full box-border"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
              data-drop-zone={column.status}
            >
              <div className="space-y-2 md:space-y-3 w-full">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move p-2 md:p-4 transition-shadow hover:shadow-md select-none overflow-hidden w-full box-border"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onTouchStart={(e) => {
                      // Only start drag if not clicking on action buttons
                      const target = e.target as HTMLElement
                      if (target.closest("button") || target.closest("a")) {
                        return
                      }
                      handleTouchStart(e, task)
                    }}
                  >
                    <div className="space-y-2 md:space-y-3 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 md:gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <TaskTitle task={task} className="leading-tight truncate text-sm md:text-base" />
                        </div>
                        <div className="flex-shrink-0">
                          <TaskActions
                            task={task}
                            userId={userId}
                            onTaskUpdated={handleTaskUpdated}
                            onDelete={handleDelete}
                            size="small"
                          />
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 break-words overflow-hidden min-w-0">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <TaskStatusBadge status={task.status} />
                        <TaskDateDisplay date={task.due_date} type="due" />
                      </div>
                      <TaskDateDisplay date={task.created_at} type="created" />
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
