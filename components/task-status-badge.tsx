"use client"

import { getStatusLabel } from "@/lib/utils/task"
import type { Task } from "@/lib/types/task"
import { cn } from "@/lib/utils"

interface TaskStatusBadgeProps {
  status: Task["status"]
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Get background color values for inline styles
  const getBackgroundColorValue = () => {
    switch (status) {
      case "todo":
        return "#2563eb" // blue-600
      case "in-progress":
        return "#f59e0b" // amber-500
      case "done":
        return "#16a34a" // green-600
      default:
        return "#4b5563" // gray-600
    }
  }

  const getHoverColorValue = () => {
    switch (status) {
      case "todo":
        return "#1d4ed8" // blue-700
      case "in-progress":
        return "#d97706" // amber-600
      case "done":
        return "#15803d" // green-700
      default:
        return "#374151" // gray-700
    }
  }

  // Use inline styles to guarantee color application
  return (
    <span
      className="inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors overflow-hidden text-white"
      style={{
        backgroundColor: getBackgroundColorValue(),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = getHoverColorValue()
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = getBackgroundColorValue()
      }}
    >
      {getStatusLabel(status)}
    </span>
  )
}

