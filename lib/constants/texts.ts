/**
 * Centralized text constants for the application
 * All user-facing strings should be defined here for easy maintenance and future internationalization
 */

export const texts = {
  // App name and branding
  appName: "TaskFlow",
  appTitle: "TaskFlow - Task Management App",
  appDescription: "Manage your tasks with ease using Kanban boards and timeline views",

  // Navigation
  nav: {
    tasks: "Tasks",
    kanban: "Kanban",
    timeline: "Timeline",
    navigation: "Navigation",
    openMenu: "Open menu",
    account: "Account",
    signOut: "Sign out",
    signIn: "Sign in",
  },

  // Home page
  home: {
    heroTitle: "Manage your tasks with ease",
    heroDescription: "Stay organized with powerful task management. View your work in Kanban boards or timeline views. Track deadlines and manage your productivity effortlessly.",
    startForFree: "Start for free",
    getStarted: "Get started",
    featuresTitle: "Everything you need to stay productive",
    taskManagement: {
      title: "Task Management",
      description: "Create, organize, and track your tasks with ease",
    },
    kanbanBoard: {
      description: "Visualize your workflow with intuitive drag-and-drop boards",
    },
    timelineView: {
      description: "Plan ahead with timeline visualization and due dates",
    },
  },

  // Authentication
  auth: {
    welcomeBack: "Welcome back",
    signInDescription: "Sign in to your account to manage your tasks",
    createAccount: "Create an account",
    signUpDescription: "Get started with your task management",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordPlaceholder: "Re-enter your password",
    signUp: "Sign up",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    checkEmail: "Check your email",
    emailVerificationDescription: "We've sent you a verification link to confirm your email address",
    emailVerificationMessage: "Click the link in the email to complete your registration and start managing your tasks.",
    returnToSignIn: "Return to sign in",
    passwordsDoNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    anErrorOccurred: "An error occurred",
    mustBeLoggedIn: "You must be logged in to create tasks",
  },

  // Task management
  tasks: {
    description: "Manage and organize your tasks",
    kanbanTitle: "Kanban Board",
    kanbanDescription: "Visualize and manage your tasks with drag-and-drop",
    timelineDescription: "Visualize your tasks over time",
    createNew: "Create new task",
    createTask: "Create task",
    creating: "Creating...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    noTasks: "No tasks found",
    noTasksDescription: "Create your first task to get started!",
    searchPlaceholder: "Search tasks...",
    filterByStatus: "Filter by status",
    sortBy: "Sort by",
    all: "All",
    complete: "Complete",
    incomplete: "Incomplete",
    toDo: "To Do",
    inProgress: "In Progress",
    done: "Done",
    sortCreatedDesc: "Newest First",
    sortCreatedAsc: "Oldest First",
    sortDueDesc: "Due Date (Latest)",
    sortDueAsc: "Due Date (Earliest)",
    allTasks: "All Tasks",
    newTask: "New Task",
    noTasksMatch: "No tasks match your filters. Try adjusting your search or filters.",
    noTasksYet: "No tasks yet. Create your first task to get started!",
    showingTasks: "Showing {count} of {total} tasks",
    saving: "Saving...",
    saveChanges: "Save changes",
    taskTitle: "Title",
    taskDescription: "Description",
    status: "Status",
    dueDate: "Due Date",
    taskTitlePlaceholder: "Task title",
    taskDescriptionPlaceholder: "Task description (optional)",
    selectDueDate: "Select due date",
    dueDateRequired: "Due date is required",
    due: "Due:",
    created: "Created:",
    updated: "Updated:",
    failedToCreate: "Failed to create task",
    failedToUpdate: "Failed to update task",
    failedToDelete: "Failed to delete task",
    previous: "Previous",
    next: "Next",
    noTasksWithDueDates: "No tasks with due dates in {month}. Add due dates to your tasks to see them on the timeline!",
    tasksWithoutDueDates: "Tasks without due dates",
    today: "Today",
    noTasksVisibleInRange: "No tasks visible in this date range",
    daysOfWeek: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
  },

  // Dialog titles and descriptions
  dialogs: {
    createTaskDescription: "Add a new task to your list. Fill in the details below.",
    editTaskTitle: "Edit task",
    editTaskDescription: "Update task details below.",
  },

  // Footer
  footer: {
    copyright: "© 2026 TaskFlow. All rights reserved.",
  },

  // 404 Not Found
  notFound: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go Home",
    goBack: "Go Back",
  },

  // Theme
  theme: {
    toggle: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
} as const

