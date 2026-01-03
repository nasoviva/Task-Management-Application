"use client"

import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { texts } from "@/lib/constants/texts"

interface TaskDateDisplayProps {
  date: string | null
  type: "due" | "created"
  className?: string
}

export function TaskDateDisplay({ date, type, className = "" }: TaskDateDisplayProps) {
  if (!date) {
    return null
  }

  const formattedDate = format(new Date(date), "MMM d, yyyy")
  const label = type === "due" ? texts.tasks.due : texts.tasks.created

  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      {type === "due" && <Calendar className="h-3 w-3" />}
      <span>
        {label} {formattedDate}
      </span>
    </div>
  )
}

