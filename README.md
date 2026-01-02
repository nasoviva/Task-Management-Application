# TaskFlow - Task Management Application

A modern task management application built with Next.js 16 and Supabase, featuring authentication, Kanban boards, timeline views, and comprehensive task management capabilities.

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


## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
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

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: For production, set this to your production URL
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### 6. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
