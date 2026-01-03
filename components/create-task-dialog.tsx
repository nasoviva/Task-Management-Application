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

interface CreateTaskDialogProps {
  children: React.ReactNode
  onTaskCreated?: (task: Task) => void
}

export function CreateTaskDialog({ children, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const supabase = createClient()
  const router = useRouter()

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("todo")
    setDueDate(undefined)
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog is closed
      resetForm()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[CreateTask] Starting task creation with title:", title)
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("[CreateTask] No user found")
        setError(texts.auth.mustBeLoggedIn)
        setIsLoading(false)
        return
      }

      console.log("[CreateTask] Creating task for user:", user.id)
      const dueDateValue = convertDateToISO(dueDate)
      const { data, error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title,
        description: description || null,
        status,
        due_date: dueDateValue,
      }).select()

      if (error) {
        console.error("[CreateTask] Error creating task:", error)
        throw error
      }

      const newTask = data?.[0]
      console.log("[CreateTask] Task created successfully:", newTask?.id)
      
      // Call callback to update parent component state
      if (newTask && onTaskCreated) {
        onTaskCreated(newTask)
      }
      
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error("[CreateTask] Task creation failed:", error)
      setError(error instanceof Error ? error.message : texts.tasks.failedToCreate)
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
            <DialogTitle>{texts.tasks.createNew}</DialogTitle>
            <DialogDescription>{texts.dialogs.createTaskDescription}</DialogDescription>
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
            />
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {texts.tasks.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? texts.tasks.creating : texts.tasks.createTask}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
