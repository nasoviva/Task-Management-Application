/**
 * Utility functions for task-related operations
 */

/**
 * Get status badge color classes
 * @param status - Task status
 * @param includeTextColor - Whether to include text color class (default: true)
 * @returns Tailwind CSS classes for status badge
 */
export function getStatusColor(status: string, includeTextColor: boolean = true): string {
  const textColor = includeTextColor ? " text-white" : ""
  switch (status) {
    case "todo":
      return `bg-blue-600${textColor} hover:bg-blue-700`
    case "in-progress":
      return `bg-amber-500${textColor} hover:bg-amber-600`
    case "done":
      return `bg-green-600${textColor} hover:bg-green-700`
    default:
      return `bg-gray-600${textColor} hover:bg-gray-700`
  }
}

/**
 * Get human-readable status label
 * @param status - Task status
 * @returns Status label string
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "todo":
      return "To Do"
    case "in-progress":
      return "In Progress"
    case "done":
      return "Done"
    default:
      return status
  }
}

/**
 * Convert Date to ISO string with time set to start of day in UTC
 * @param date - Date object to convert
 * @returns ISO string or null if date is undefined
 */
export function convertDateToISO(date: Date | undefined): string | null {
  if (!date) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString()
}

