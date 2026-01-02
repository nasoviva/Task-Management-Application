"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import type { Task } from "@/lib/types/task"

interface TaskActionsProps {
  task: Task
  userId: string
  onTaskUpdated: (task: Task) => void
  onDelete: (taskId: string) => void
  size?: "default" | "small"
}

export function TaskActions({ task, userId, onTaskUpdated, onDelete, size = "default" }: TaskActionsProps) {
  const iconSize = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"
  const buttonSize = size === "small" ? "h-7 w-7" : "h-8 w-8"

  return (
    <div className="flex items-center gap-2">
      <EditTaskDialog task={task} onTaskUpdated={onTaskUpdated} userId={userId}>
        <Button variant="ghost" size="icon" className={buttonSize}>
          <Pencil className={iconSize} />
        </Button>
      </EditTaskDialog>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} text-destructive hover:text-destructive`}
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className={iconSize} />
      </Button>
    </div>
  )
}

