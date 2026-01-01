"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Task } from "@/lib/types/task"
import { convertDateToISO } from "@/lib/utils/task"

interface EditTaskDialogProps {
  task: Task
  children: React.ReactNode
  onTaskUpdated: (task: Task) => void
  userId: string
}

export function EditTaskDialog({ task, children, onTaskUpdated, userId }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(task.status)
  const [dueDate, setDueDate] = useState<Date | undefined>(task.due_date ? new Date(task.due_date) : undefined)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[EditTask] Starting task update for task:", task.id)
    setIsLoading(true)
    setError(null)

    try {
      console.log("[EditTask] Updating task with data:", { title, status, due_date: dueDate })
      const dueDateValue = convertDateToISO(dueDate)
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title,
          description: description || null,
          status,
          due_date: dueDateValue,
        })
        .eq("id", task.id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("[EditTask] Error updating task:", error)
        throw error
      }

      if (data) {
        console.log("[EditTask] Task updated successfully:", data.id)
        onTaskUpdated(data)
      }

      setOpen(false)
      setError(null)
      router.refresh()
    } catch (error) {
      console.error("[EditTask] Task update failed:", error)
      setError(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Update the task details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value: "todo" | "in-progress" | "done") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-due-date">Due Date</Label>
              <DatePicker value={dueDate} onChange={setDueDate} placeholder="Select due date" />
            </div>
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
