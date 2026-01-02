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

### Troubleshooting

**Problem: "Your project's URL and Key are required to create a Supabase client!"**
- Solution: Make sure you've created `.env.local` file with correct Supabase credentials (see step 4)

**Problem: "relation 'tasks' does not exist"**
- Solution: Make sure you've run the SQL script from step 5 to create the tasks table

**Problem: Can't sign up or login**
- Solution: Check that RLS policies were created correctly in step 5, and verify your Supabase project is active

## Project Structure

```
Task-Management-Application/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Feature components
├── lib/                   # Utilities and configurations
│   ├── supabase/          # Supabase client setup
│   ├── database.types.ts # Database type definitions
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Utility functions
│       └── task.ts        # Task-related utilities
├── scripts/               # SQL migration scripts
│   └── 001_create_tasks_table.sql  # Database setup script
└── public/                # Static assets
```

## Design Decisions & Trade-offs

### 1. **Type Safety with Database Types**
- Created a centralized `database.types.ts` file to ensure type consistency across the application
- All components use the same `Task` type from `lib/types/task.ts` to prevent type mismatches
- **Trade-off**: Requires manual updates when database schema changes, but ensures compile-time safety

### 2. **Row Level Security (RLS)**
- Implemented RLS policies in Supabase to ensure users can only access their own tasks
- All database queries are filtered by `user_id` on both client and server side for defense in depth
- **Trade-off**: Slightly more complex queries, but significantly improves security

### 3. **Server and Client Components**
- Used Next.js Server Components for data fetching (pages) and Client Components for interactivity
- **Trade-off**: More complex component structure, but better performance and SEO

### 4. **Timeline View Implementation**
- Timeline view uses `due_date` instead of separate `start_date` and `end_date` fields
- Simplified the data model while still providing timeline functionality
- **Trade-off**: Less granular timeline control, but simpler and more intuitive for users

### 5. **Optimistic UI Updates**
- Implemented optimistic updates in task list for better UX (immediate feedback)
- Rollback on error to maintain data consistency
- **Trade-off**: More complex state management, but significantly better user experience

### 6. **Code Reusability and DRY Principles**
- Created utility functions in `lib/utils/task.ts` to eliminate code duplication
- Shared functions for status colors, labels, and date conversion across components
- **Trade-off**: Slightly more abstraction, but significantly reduces maintenance burden and ensures consistency

## What Would I Improve with More Time?

- Comprehensive unit tests for components
- Integration tests for authentication flows
- Pagination for large task lists
- Task categories/tags
- Task priorities
- Export/import tasks (JSON, CSV)
- Task statistics for a selected period
- Trash bin for deleted tasks (with restore option)
- Rich text editor for task descriptions
- Offline support with service workers
- Create user guide/documentation

## License

This project is created for assessment purposes.

## Contributing

This is an assessment project. For questions or issues, please contact the repository owner.
