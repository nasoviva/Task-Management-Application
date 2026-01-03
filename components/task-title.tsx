"use client"

import type { Task } from "@/lib/types/task"
import { cn } from "@/lib/utils"

interface TaskTitleProps {
  task: Task
  className?: string
  as?: "h2" | "h3" | "h4" | "div" | "span"
}

export function TaskTitle({ task, className = "", as: Component = "h3" }: TaskTitleProps) {
  const isDone = task.status === "done"
  
  return (
    <Component
      className={cn(
        "font-medium",
        isDone && "text-muted-foreground line-through",
        className
      )}
    >
      {task.title}
    </Component>
  )
}

