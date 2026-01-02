"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
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
                      <TaskActions
                        task={task}
                        userId={userId}
                        onTaskUpdated={handleTaskUpdated}
                        onDelete={handleDelete}
                      />
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
