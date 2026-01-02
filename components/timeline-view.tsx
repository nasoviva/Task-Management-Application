"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TaskFiltersBar } from "@/components/task-filters-bar"
import { TaskActions } from "@/components/task-actions"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"
import { useTaskActions } from "@/lib/hooks/use-task-actions"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, differenceInDays, startOfDay, startOfWeek, endOfWeek } from "date-fns"
import type { Task } from "@/lib/types/task"
import { getStatusColor, getStatusLabel } from "@/lib/utils/task"
import { texts } from "@/lib/constants/texts"

interface TimelineViewProps {
  initialTasks: Task[]
  userId: string
}

interface TaskBar {
  task: Task
  startDate: Date
  endDate: Date
  leftPercent: number
  widthPercent: number
  row: number
  topPercent?: number
  heightPercent?: number
}

export function TimelineView({ initialTasks, userId }: TimelineViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return startOfMonth(new Date())
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { tasks, handleDelete, handleTaskUpdated, handleTaskCreated } = useTaskActions({
    initialTasks,
    userId,
  })

  const filteredTasks = useTaskFilters(tasks, statusFilter, searchQuery)

  // Show current month with full weeks (from Monday to Sunday)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }) // Sunday
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group days into weeks (7 days per week)
  const weeks = useMemo(() => {
    const weekGroups: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7))
    }
    return weekGroups
  }, [days])

  // Calculate timeline range - use full week range
  const timelineRange = useMemo(() => {
    const rangeStart = startOfDay(weekStart)
    const rangeEnd = startOfDay(weekEnd)
    
    return { start: rangeStart, end: rangeEnd }
  }, [weekStart, weekEnd])

  const totalDays = differenceInDays(timelineRange.end, timelineRange.start) + 1

  // Calculate task bars positions
  const taskBars = useMemo(() => {
    const bars: TaskBar[] = []
    const rowOccupancy: Map<number, Array<{ start: number; end: number }>> = new Map()

    const assignRow = (startDay: number, endDay: number): number => {
      for (let row = 0; row < 100; row++) {
        const occupied = rowOccupancy.get(row) || []
        const overlaps = occupied.some(
          (range) => !(endDay < range.start || startDay > range.end)
        )

        if (!overlaps) {
          if (!rowOccupancy.has(row)) {
            rowOccupancy.set(row, [])
          }
          rowOccupancy.get(row)!.push({ start: startDay, end: endDay })
          return row
        }
      }
      return 0
    }

    filteredTasks.forEach((task) => {
      const startDate = startOfDay(new Date(task.created_at))
      // For tasks without due_date, use created_at + 1 month as end date
      const endDate = task.due_date ? startOfDay(new Date(task.due_date)) : startOfDay(addMonths(new Date(task.created_at), 1))

      // Only show tasks that overlap with the timeline range
      // Task overlaps if: (startDate <= range.end && endDate >= range.start)
      if (startDate > timelineRange.end || endDate < timelineRange.start) {
        return
      }

      const clampedStart = startDate < timelineRange.start ? timelineRange.start : startDate
      const clampedEnd = endDate > timelineRange.end ? timelineRange.end : endDate

      const startDay = differenceInDays(clampedStart, timelineRange.start)
      const endDay = differenceInDays(clampedEnd, timelineRange.start)

      // Find which week and day of week for start and end
      const startWeekIndex = Math.floor(startDay / 7)
      const startDayOfWeek = startDay % 7
      const endWeekIndex = Math.floor(endDay / 7)
      const endDayOfWeek = endDay % 7

      // Google Calendar style: dayOfWeek = column (left-right), weekIndex = row (top-bottom)
      // Structure: Days of week are columns (Mon=0, Tue=1, ..., Sun=6), Weeks are rows
      
      // Calculate left position: which column (day of week) the task starts in
      const leftPercent = (startDayOfWeek / 7) * 100
      
      // Calculate total number of days the task occupies (inclusive)
      const totalDays = endDay - startDay + 1
      
      // Calculate width: each day occupies 1/7 of a column width
      // For tasks spanning multiple weeks, we need to calculate width correctly
      // The width should span from startDayOfWeek to endDayOfWeek across all weeks
      let widthPercent: number
      if (startWeekIndex === endWeekIndex) {
        // Task is within one week - spans from startDayOfWeek to endDayOfWeek
        const daysInWeek = endDayOfWeek - startDayOfWeek + 1
        widthPercent = (daysInWeek / 7) * 100
      } else {
        // Task spans multiple weeks
        // Calculate: days remaining in first week + full weeks + days in last week
        // Days from start to end of first week (inclusive)
        const daysInFirstWeek = 7 - startDayOfWeek
        // Full weeks in between (if any)
        const fullWeeksBetween = endWeekIndex - startWeekIndex - 1
        // Days from start of last week (Monday = 0) to endDayOfWeek (inclusive)
        const daysInLastWeek = endDayOfWeek + 1
        
        // Total columns (days) the task spans across all weeks
        const totalColumns = daysInFirstWeek + (fullWeeksBetween * 7) + daysInLastWeek
        
        // Verify: totalColumns should equal totalDays
        // If not, there's a calculation error
        if (Math.abs(totalColumns - totalDays) > 1) {
          console.warn(`[Timeline] Width calculation mismatch for task ${task.id}: totalColumns=${totalColumns}, totalDays=${totalDays}`)
        }
        
        // For multi-week tasks, the bar should visually span all days it occupies
        // Calculate width based on total days, but for rendering we'll need to handle it differently
        // The bar should start at startDayOfWeek and span to the end of the container
        // in the first week, then continue in subsequent weeks
        // For now, calculate width to span from start to end of first week
        // The actual rendering will need to handle multi-week spans
        const daysFromStartToEndOfFirstWeek = 7 - startDayOfWeek
        widthPercent = (daysFromStartToEndOfFirstWeek / 7) * 100
      }
      
      // Calculate how many weeks the task spans (for height calculation)
      const weeksSpanned = endWeekIndex - startWeekIndex + 1
      
      const topPercent = (startWeekIndex / weeks.length) * 100
      const heightPercent = (weeksSpanned / weeks.length) * 100

      // Use dayOfWeek as row for overlapping tasks in same day
      const row = assignRow(startDay, endDay)

      // For multi-week tasks, create separate bars for each week
      // But only for weeks that are within the current timeline range
      if (startWeekIndex === endWeekIndex) {
        // Single week - one bar (only if within range)
        if (startWeekIndex >= 0 && startWeekIndex < weeks.length) {
          bars.push({
            task,
            startDate: clampedStart,
            endDate: clampedEnd,
            leftPercent,
            widthPercent,
            row,
            topPercent,
            heightPercent,
          })
        }
      } else {
        // Multi-week - create bars for each week that's within the timeline range
        // First week: from startDayOfWeek to end of week
        if (startWeekIndex >= 0 && startWeekIndex < weeks.length) {
          const firstWeekLeftPercent = (startDayOfWeek / 7) * 100
          const firstWeekWidthPercent = ((7 - startDayOfWeek) / 7) * 100
          bars.push({
            task,
            startDate: clampedStart,
            endDate: clampedEnd,
            leftPercent: firstWeekLeftPercent,
            widthPercent: firstWeekWidthPercent,
            row,
            topPercent: (startWeekIndex / weeks.length) * 100,
            heightPercent: (1 / weeks.length) * 100,
          })
        }

        // Intermediate weeks: full width (Monday to Sunday)
        // Only create bars for weeks within the timeline range
        for (let weekIndex = startWeekIndex + 1; weekIndex < endWeekIndex; weekIndex++) {
          if (weekIndex >= 0 && weekIndex < weeks.length) {
            bars.push({
              task,
              startDate: clampedStart,
              endDate: clampedEnd,
              leftPercent: 0, // Start from Monday
              widthPercent: 100, // Full week width
              row,
              topPercent: (weekIndex / weeks.length) * 100,
              heightPercent: (1 / weeks.length) * 100,
            })
          }
        }

        // Last week: from start of week to endDayOfWeek
        // Only if within the timeline range
        if (endWeekIndex >= 0 && endWeekIndex < weeks.length) {
          const lastWeekLeftPercent = 0 // Start from Monday
          const lastWeekWidthPercent = ((endDayOfWeek + 1) / 7) * 100
          bars.push({
            task,
            startDate: clampedStart,
            endDate: clampedEnd,
            leftPercent: lastWeekLeftPercent,
            widthPercent: lastWeekWidthPercent,
            row,
            topPercent: (endWeekIndex / weeks.length) * 100,
            heightPercent: (1 / weeks.length) * 100,
          })
        }
      }
    })

    return bars.sort((a, b) => a.row - b.row)
  }, [filteredTasks, timelineRange, totalDays, weeks.length])


  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(startOfMonth(new Date()))
  }

  // Calculate day positions for vertical layout (weeks as columns)
  const dayPositions = useMemo(() => {
    const positions: Array<{
      day: Date
      weekIndex: number
      dayOfWeek: number
      isCurrentMonth: boolean
      isToday: boolean
    }> = []
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayOfWeek) => {
        const isCurrentMonth = day >= monthStart && day <= monthEnd
        const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
        positions.push({
          day,
          weekIndex,
          dayOfWeek,
          isCurrentMonth,
          isToday,
        })
      })
    })
    
    return positions
  }, [weeks, monthStart, monthEnd])


  return (
    <div className="space-y-6">
      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTaskCreated={(task) => handleTaskCreated(task, false)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday} className="ml-4">
            Today
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Set(taskBars.map(bar => bar.task.id)).size} of {filteredTasks.length} tasks visible
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <Card className="overflow-hidden p-4">
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: "100%", minWidth: "800px", height: `${weeks.length * 100 + 48}px`, overflow: "visible" }}>
              {/* Day of week headers (top) - horizontal */}
              <div className="absolute top-0 left-0 right-0 h-12 border-b bg-muted/50">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, dayIndex) => (
                  <div
                    key={dayName}
                    className="absolute border-r border-muted-foreground/40 last:border-r-0"
                    style={{
                      left: `${(dayIndex / 7) * 100}%`,
                      width: `${(1 / 7) * 100}%`,
                      height: "100%",
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="text-xs font-semibold text-muted-foreground">{dayName}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Day cells grid - days as columns, weeks as rows (Google Calendar style) */}
              <div className="absolute top-12 left-0 right-0" style={{ height: `${weeks.length * 100}px` }}>
                {/* Day columns */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
                  <div
                    key={dayOfWeek}
                    className="absolute border-r border-muted-foreground/30 last:border-r-0"
                    style={{
                      left: `${(dayOfWeek / 7) * 100}%`,
                      width: `${(1 / 7) * 100}%`,
                      height: "100%",
                    }}
                  >
                    {/* Week rows */}
                    {weeks.map((week, weekIndex) => {
                      const day = week[dayOfWeek]
                      if (!day) return null
                      
                      const isCurrentMonth = day >= monthStart && day <= monthEnd
                      const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                      const dayNumber = format(day, "d")
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayOfWeek}`}
                          className={`absolute border-b border-muted-foreground/20 last:border-b-0 ${!isCurrentMonth ? "bg-muted/20" : ""} ${isToday ? "bg-primary/5 border-primary/30" : ""}`}
                          style={{
                            top: `${(weekIndex / weeks.length) * 100}%`,
                            height: `${(1 / weeks.length) * 100}%`,
                            width: "100%",
                            pointerEvents: "none",
                            zIndex: 30, // Higher than task bars (zIndex: 20) so dates are visible on top
                          }}
                        >
                          <div className={`h-full p-2 flex items-start justify-between ${isToday ? "text-primary font-semibold" : isCurrentMonth ? "" : "text-muted-foreground"}`}>
                            <span className="text-sm font-medium">{dayNumber}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

            {/* Task bars */}
            <div className="absolute top-12 left-0 right-0" style={{ height: `${weeks.length * 100}px`, width: "100%", zIndex: 5 }}>
              {taskBars.length === 0 && filteredTasks.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No tasks visible in this date range. Try navigating to different months.
                  </p>
                </div>
              )}
              {taskBars.map((bar, barIndex) => {
                // Use pre-calculated positions from taskBars
                const leftPercent = bar.leftPercent
                const widthPercent = bar.widthPercent
                
                const weekRowHeightPx = 100 // Height of one week row in pixels
                // Use topPercent from bar (already calculated for each week segment)
                const weekIndex = Math.floor((bar.topPercent || 0) * weeks.length / 100)
                const topOffsetPx = weekIndex * weekRowHeightPx
                
                // Bar height: fixed (like Google Calendar) - one bar per week
                const barHeight = 22 // Fixed height in pixels
                const rowOffset = bar.row * (barHeight + 2) // Offset for overlapping tasks in same day
                const dateAreaHeight = 28 // Height reserved for date display at top of cell
                const finalTopPx = topOffsetPx + dateAreaHeight + rowOffset + 2 // Position bars below date area
                
                return (
                  <EditTaskDialog
                    key={`${bar.task.id}-${barIndex}`}
                    task={bar.task}
                    onTaskUpdated={handleTaskUpdated}
                    userId={userId}
                  >
                    <div
                      className="absolute group"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: `${finalTopPx}px`,
                        height: `${barHeight}px`,
                        padding: "0 2px",
                        zIndex: 5, // Lower than dates (zIndex: 30) so bars are under dates
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        className={`h-full rounded px-2 py-0.5 transition-all cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] border border-white/50 ${
                          getStatusColor(bar.task.status, true)
                        }`}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          backgroundColor: bar.task.status === "todo" ? "#2563eb" : 
                                         bar.task.status === "in-progress" ? "#f59e0b" : 
                                         bar.task.status === "done" ? "#16a34a" : "#4b5563",
                        }}
                        title={`${bar.task.title} (${format(bar.startDate, "MMM d")} - ${format(bar.endDate, "MMM d")})`}
                      >
                        <span className={`text-xs font-semibold truncate text-white drop-shadow-sm whitespace-nowrap select-none w-full leading-tight ${bar.task.status === "done" ? "line-through opacity-80" : ""}`}>
                          {bar.task.title}
                        </span>
                      </div>
                    </div>
                  </EditTaskDialog>
                )
              })}
            </div>

            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">{texts.tasks.noTasksMatch}</p>
        </Card>
      )}
    </div>
  )
}
