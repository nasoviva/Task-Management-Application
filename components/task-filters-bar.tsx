"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, Plus } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import type { Task } from "@/lib/types/task"
import { texts } from "@/lib/constants/texts"

interface TaskFiltersBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onTaskCreated: (task: Task) => void
  sortBy?: string
  onSortChange?: (value: string) => void
}

export function TaskFiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onTaskCreated,
  sortBy,
  onSortChange,
}: TaskFiltersBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full">
      <Card className="flex-1 p-4 min-w-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={texts.tasks.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[140px] md:w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={texts.tasks.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{texts.tasks.allTasks}</SelectItem>
                <SelectItem value="todo">{texts.tasks.toDo}</SelectItem>
                <SelectItem value="in-progress">{texts.tasks.inProgress}</SelectItem>
                <SelectItem value="done">{texts.tasks.done}</SelectItem>
                <SelectItem value="incomplete">{texts.tasks.incomplete}</SelectItem>
              </SelectContent>
            </Select>
            {sortBy !== undefined && onSortChange && (
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-[140px] md:w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={texts.tasks.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created-desc">{texts.tasks.sortCreatedDesc}</SelectItem>
                  <SelectItem value="created-asc">{texts.tasks.sortCreatedAsc}</SelectItem>
                  <SelectItem value="due-asc">{texts.tasks.sortDueAsc}</SelectItem>
                  <SelectItem value="due-desc">{texts.tasks.sortDueDesc}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </Card>
      <CreateTaskDialog onTaskCreated={onTaskCreated}>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{texts.tasks.newTask}</span>
          <span className="sm:hidden">New</span>
        </Button>
      </CreateTaskDialog>
    </div>
  )
}

