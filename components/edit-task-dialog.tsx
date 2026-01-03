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
import { TaskFormFields } from "@/components/task-form-fields"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Task } from "@/lib/types/task"
import { convertDateToISO } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

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
  // If task doesn't have due_date, use created_at as default
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : new Date(task.created_at)
  )
  const supabase = createClient()
  const router = useRouter()

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset to task values when opening
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setDueDate(task.due_date ? new Date(task.due_date) : new Date(task.created_at))
      setError(null)
    }
  }

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
      setError(error instanceof Error ? error.message : texts.tasks.failedToUpdate)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{texts.dialogs.editTaskTitle}</DialogTitle>
            <DialogDescription>{texts.dialogs.editTaskDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-[26px] pb-[26px]">
            <TaskFormFields
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              status={status}
              onStatusChange={setStatus}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              titleId="edit-title"
              descriptionId="edit-description"
              statusId="edit-status"
              dueDateId="edit-due-date"
            />
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {texts.tasks.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? texts.tasks.saving : texts.tasks.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
