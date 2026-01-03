import { useMemo } from "react"
import type { Task } from "@/lib/types/task"

export function useTaskFilters(tasks: Task[], statusFilter: string, searchQuery: string) {
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "incomplete") {
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

  return filteredTasks
}

