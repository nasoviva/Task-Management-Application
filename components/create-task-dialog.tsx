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
            <DialogTitle>{texts.dialogs.createTaskTitle}</DialogTitle>
            <DialogDescription>{texts.dialogs.createTaskDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{texts.tasks.taskTitle}</Label>
              <Input
                id="title"
                placeholder={texts.tasks.taskTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{texts.tasks.taskDescription}</Label>
              <Textarea
                id="description"
                placeholder={texts.tasks.taskDescriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">{texts.tasks.status}</Label>
              <Select value={status} onValueChange={(value: "todo" | "in-progress" | "done") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{texts.tasks.toDo}</SelectItem>
                  <SelectItem value="in-progress">{texts.tasks.inProgress}</SelectItem>
                  <SelectItem value="done">{texts.tasks.done}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due-date">{texts.tasks.dueDate}</Label>
              <DatePicker value={dueDate} onChange={setDueDate} placeholder={texts.tasks.selectDueDate} />
            </div>
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {texts.tasks.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? texts.tasks.creating : texts.tasks.createTask}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
