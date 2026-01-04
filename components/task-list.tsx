"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { TaskDateDisplay } from "@/components/task-date-display"
import { TaskStatusBadge } from "@/components/task-status-badge"
import { TaskTitle } from "@/components/task-title"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
import type { Task } from "@/lib/types/task"
import { texts } from "@/lib/constants/texts"

interface TaskListProps {
  initialTasks: Task[]
  userId: string
  onCreateTask?: (task: Task) => void
}

export function TaskList({ initialTasks, userId, onCreateTask }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("created-desc")

  const { tasks, handleDelete, handleTaskUpdated, handleTaskCreated, handleStatusUpdate } = useTaskActions({
    initialTasks,
    userId,
  })

  const handleToggleComplete = async (taskId: string, currentStatus: "todo" | "in-progress" | "done") => {
    const newStatus = currentStatus === "done" ? "todo" : "done"
    await handleStatusUpdate(taskId, newStatus)
  }

  const onTaskCreated = (newTask: Task) => {
    handleTaskCreated(newTask)
    if (onCreateTask) {
      onCreateTask(newTask)
    }
  }

  const filteredTasks = useTaskFilters(tasks, statusFilter, searchQuery)

  const filteredAndSortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]

    // Sort tasks
    sorted.sort((a, b) => {
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

    return sorted
  }, [filteredTasks, sortBy])


  return (
    <div className="space-y-6">
      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTaskCreated={onTaskCreated}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <TaskTitle task={task} />
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground break-words overflow-hidden line-clamp-4">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <TaskActions
                        task={task}
                        userId={userId}
                        onTaskUpdated={handleTaskUpdated}
                        onDelete={handleDelete}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <TaskDateDisplay date={task.due_date} type="due" />
                    </div>
                    <TaskDateDisplay date={task.created_at} type="created" />
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
