# TaskFlow - Task Management Application

A modern task management application built with Next.js 16 and Supabase, featuring authentication, Kanban boards, timeline views, and comprehensive task management capabilities.

🌐 **Live Demo**: [https://task-management-application-nasoviva.vercel.app](https://task-management-application-nasoviva.vercel.app)

## Features

### Core Features
- **User Authentication**
  - Sign up with email/password
  - Sign in / Sign out
  - Email verification

- **Task Management**
  - Create tasks with title, description, and due date
  - View tasks in list, Kanban, or timeline views
  - Mark tasks as complete or incomplete
  - Edit existing tasks
  - Delete tasks
  - Filter tasks by status (all / complete / incomplete / todo / in-progress / done)
  - Search tasks by title or description
  - Sort tasks by creation date or due date

- **User Interface**
  - Clean, responsive design (mobile and desktop)
  - Dark mode support
  - Modern UI with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (via shadcn/ui)
- **Type Safety**: TypeScript
- **Date Handling**: date-fns, react-day-picker

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm**, **pnpm**, or **yarn** package manager
- A **Supabase account** (free at [supabase.com](https://supabase.com))
- **Git** (for cloning the repository)

## Setup Instructions

Follow these steps to set up and run the application locally:

### 1. Clone the Repository

```bash
git clone https://github.com/nasoviva/Task-Management-Application.git
cd Task-Management-Application
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings → API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   ```

   Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from step 3.

### 5. Set Up the Database

1. Go to your Supabase project → SQL Editor
2. Open the file `scripts/001_create_tasks_table.sql` from the project
3. Copy the entire SQL script and paste it into the Supabase SQL Editor
4. Click "Run" to execute the script
5. This will create:
   - The `tasks` table with all required columns
   - Row Level Security (RLS) policies to ensure users can only access their own tasks
   - Indexes for better query performance

### 6. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Decisions

This section explains the key technical decisions made during development and why they were chosen.

### 1. **TypeScript and Centralized Types**
- **Decision**: All data types are defined in `database.types.ts` and shared across the application
- **Why**: Prevents type errors and ensures consistency - if you use wrong data type, you'll see error immediately

### 2. **Security: Row Level Security (RLS)**
- **Decision**: Database-level security policies ensure users can only see their own tasks
- **Why**: Even if there's a bug in application code, database won't allow accessing other users' data

### 3. **Next.js Server and Client Components**
- **Decision**: Pages fetch data on server (Server Components), interactive parts run on client (Client Components)
- **Why**: Faster loading for users, better SEO, but still allows interactivity where needed

### 4. **Optimistic UI Updates**
- **Decision**: UI updates immediately when user deletes or changes task, before server responds
- **Why**: Feels instant and responsive - user sees changes right away

### 5. **Code Reusability**
- **Decision**: Created shared components (`TaskFiltersBar`, `TaskActions`, `AuthHeader`) and hooks (`useTaskActions`, `useTaskFilters`)
- **Why**: Same code used in multiple places - if we need to change something, change it once

## What Would I Improve with More Time?

- Tests for components and for authentication flows
- Pagination for large task lists
- Task categories/priorities
- Export/import tasks (JSON, CSV)
- Task statistics for a selected period
- Trash bin for deleted tasks (with restore option)
- Rich text editor for task descriptions
- Offline support with service workers
- Create user guide/documentation
- Multi-language support

## Contributing

This is an assessment project. For questions or issues, please contact the repository owner.
