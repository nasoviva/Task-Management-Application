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
    const deletedTask = tasks.find((task) => task.id === taskId)
    setTasks(tasks.filter((task) => task.id !== taskId))

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("[TaskActions] Error deleting task:", error)
      if (deletedTask) {
        setTasks([...tasks, deletedTask])
      }
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
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    )

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId)
      .eq("user_id", userId)

    if (error) {
      console.error("[TaskActions] Error updating task status:", error)
      // Revert on error - will be synced by router.refresh()
      router.refresh()
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

