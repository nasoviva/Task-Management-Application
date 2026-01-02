import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Task } from "@/lib/types/task"

interface UseTaskActionsProps {
  initialTasks: Task[]
  userId: string
}

export function useTaskActions({ initialTasks, userId }: UseTaskActionsProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const supabase = createClient()
  const router = useRouter()

  // Sync initialTasks with state when they change (e.g., after router.refresh())
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleDelete = async (taskId: string) => {
    console.log("[TaskActions] Deleting task:", taskId)
    
    // Save current state for rollback
    const currentTasks = tasks
    const deletedTask = currentTasks.find((task) => task.id === taskId)
    
    if (!deletedTask) {
      console.error("[TaskActions] Task not found for deletion")
      return
    }

    // Optimistic update - remove from UI immediately
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

    // Delete from database
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[TaskActions] Error deleting task:", error)
      // Rollback on error - restore the task to its original position
      setTasks(currentTasks)
      return
    }

    console.log("[TaskActions] Task deleted successfully")
    router.refresh()
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskCreated = (newTask: Task, prepend: boolean = true) => {
    console.log("[TaskActions] Adding new task:", newTask.id)
    if (prepend) {
      setTasks([newTask, ...tasks])
    } else {
      setTasks([...tasks, newTask])
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    console.log("[TaskActions] Updating task status:", taskId, "to", newStatus)
    const task = tasks.find((t) => t.id === taskId)
    const oldStatus = task?.status

    if (!task || !oldStatus) {
      console.error("[TaskActions] Task not found for status update")
      return
    }

    // Optimistic update - update UI immediately
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    // Update in database
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId)
      .eq("user_id", userId)

    if (error) {
      console.error("[TaskActions] Error updating task status:", error)
      // Rollback on error
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
      )
      return
    }

    console.log("[TaskActions] Task status updated successfully")
    router.refresh()
  }

  return {
    tasks,
    setTasks,
    handleDelete,
    handleTaskUpdated,
    handleTaskCreated,
    handleStatusUpdate,
  }
}

