"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
import { format, startOfMonth, endOfMonth } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

interface TimelineViewProps {
  initialTasks: Task[]
  userId: string
}

export function TimelineView({ initialTasks, userId }: TimelineViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { tasks, handleDelete, handleTaskUpdated, handleTaskCreated } = useTaskActions({
    initialTasks,
    userId,
  })

  const filteredTasks = useTaskFilters(tasks, statusFilter, searchQuery)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const tasksWithDueDate = filteredTasks
    .filter((task) => task.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  const tasksWithoutDueDate = filteredTasks.filter((task) => !task.due_date)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const tasksInMonth = tasksWithDueDate.filter((task) => {
    const dueDate = new Date(task.due_date!)
    return dueDate >= monthStart && dueDate <= monthEnd
  })

  return (
    <div className="space-y-6">
      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTaskCreated={(task) => handleTaskCreated(task, false)}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={previousMonth}>
            {texts.tasks.previous}
          </Button>
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" onClick={nextMonth}>
            {texts.tasks.next}
          </Button>
        </div>
      </div>

      {tasksInMonth.length > 0 ? (
        <div className="space-y-4">
          {tasksInMonth.map((task) => {
            const dueDate = new Date(task.due_date!)
            const createdDate = new Date(task.created_at)
            const isOverdue = dueDate < new Date() && task.status !== "done"

            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h3>
                        {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                      </div>
                      <TaskActions
                        task={task}
                        userId={userId}
                        onTaskUpdated={handleTaskUpdated}
                        onDelete={handleDelete}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={getStatusColor(task.status, false)}>{getStatusLabel(task.status)}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {texts.tasks.due} {format(dueDate, "MMM d, yyyy")}
                      </div>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {texts.tasks.created} {format(createdDate, "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            {texts.tasks.noTasksWithDueDates.replace("{month}", format(currentMonth, "MMMM yyyy"))}
          </p>
        </Card>
      )}

      {tasksWithoutDueDate.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{texts.tasks.tasksWithoutDueDates}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {tasksWithoutDueDate.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h3>
                      <TaskActions
                        task={task}
                        userId={userId}
                        onTaskUpdated={handleTaskUpdated}
                        onDelete={handleDelete}
                        size="small"
                      />
                    </div>
                    <Badge className={`${getStatusColor(task.status, false)} text-xs`}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
