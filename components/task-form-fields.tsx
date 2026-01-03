"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { texts } from "@/lib/constants/texts"

interface TaskFormFieldsProps {
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  status: "todo" | "in-progress" | "done"
  onStatusChange: (value: "todo" | "in-progress" | "done") => void
  dueDate: Date | undefined
  onDueDateChange: (value: Date | undefined) => void
  titleId?: string
  descriptionId?: string
  statusId?: string
  dueDateId?: string
}

export function TaskFormFields({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  status,
  onStatusChange,
  dueDate,
  onDueDateChange,
  titleId = "title",
  descriptionId = "description",
  statusId = "status",
  dueDateId = "due-date",
}: TaskFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={titleId}>
          {texts.tasks.taskTitle} <span className="text-foreground">*</span>
        </Label>
        <Input
          id={titleId}
          placeholder={texts.tasks.taskTitlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={descriptionId}>{texts.tasks.taskDescription}</Label>
        <Textarea
          id={descriptionId}
          placeholder={texts.tasks.taskDescriptionPlaceholder}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={statusId}>{texts.tasks.status}</Label>
        <Select value={status} onValueChange={onStatusChange}>
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
        <Label htmlFor={dueDateId}>
          {texts.tasks.dueDate} <span className="text-foreground">*</span>
        </Label>
        <DatePicker value={dueDate} onChange={onDueDateChange} placeholder={texts.tasks.selectDueDate} />
      </div>
    </>
  )
}

