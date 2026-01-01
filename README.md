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
- **Date Handling**: date-fns, react-day-picker

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A Supabase account and project ([supabase.com](https://supabase.com))

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

### 5. Set Up the Database

1. Go to your Supabase project → SQL Editor
2. Run the SQL scripts in order:
   - First, run `scripts/001_create_tasks_table.sql` to create the tasks table and RLS policies
   - Then, run `scripts/002_remove_start_end_dates.sql` to remove the start_date and end_date columns (if they exist)

### 6. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
│   ├── database.types.ts  # Database type definitions
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Utility functions
│       └── task.ts        # Task-related utilities
├── scripts/               # SQL migration scripts
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

### 6. **Console Logging for Debugging**
- Added comprehensive console.logs throughout the application for debugging
- All logs are prefixed with component/feature name for easy filtering
- **Trade-off**: Slightly more verbose code, but much easier to debug issues in production

### 7. **Code Reusability and DRY Principles**
- Created utility functions in `lib/utils/task.ts` to eliminate code duplication
- Shared functions for status colors, labels, and date conversion across components
- **Trade-off**: Slightly more abstraction, but significantly reduces maintenance burden and ensures consistency

## Security Considerations

- ✅ Environment variables are never committed to the repository
- ✅ Row Level Security (RLS) policies enforce data isolation
- ✅ All database queries filter by authenticated user ID
- ✅ Supabase anon key is safe to expose (protected by RLS)
- ✅ Server-side authentication checks on all protected routes

## What Would I Improve with More Time?

### 1. **Testing**
- Add comprehensive unit tests for components
- Add integration tests for authentication flows
- Add E2E tests for critical user paths
- Set up a testing framework (Jest, React Testing Library, Playwright)

### 2. **Performance Optimizations**
- Implement React Query or SWR for better data caching and synchronization
- Add pagination for large task lists
- Implement virtual scrolling for Kanban boards with many tasks
- Optimize bundle size with code splitting

### 3. **Features**
- Task categories/tags
- Task priorities
- Task dependencies
- Recurring tasks
- Task templates
- Bulk operations (delete, update multiple tasks)
- Export/import tasks (JSON, CSV)
- Task comments and collaboration
- Real-time updates using Supabase Realtime

### 4. **User Experience**
- Keyboard shortcuts
- Drag and drop file attachments
- Rich text editor for task descriptions
- Task activity history/audit log
- Better mobile experience with swipe gestures
- Offline support with service workers

### 5. **Code Quality**
- Add ESLint rules and fix all warnings
- Add Prettier for consistent code formatting
- Set up pre-commit hooks with Husky
- Add CI/CD pipeline with automated tests
- Generate database types automatically from Supabase schema

### 6. **Documentation**
- Add JSDoc comments to all functions
- Create API documentation
- Add component storybook
- Create user guide/documentation

### 7. **Monitoring & Analytics**
- Add error tracking (Sentry)
- Add analytics for user behavior
- Add performance monitoring
- Add database query performance monitoring

## Environment Variables

See `.env.example` for required environment variables. Never commit your `.env.local` file to version control.

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Environment Variables

- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` - Redirect URL for email verification (defaults to `${window.location.origin}/dashboard`)

## Deployment

### Deploying to Production

1. **Set up environment variables** in your hosting platform (Vercel, Netlify, etc.):
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` - Your production URL (e.g., `https://yourdomain.com/dashboard`)

2. **Configure Supabase Redirect URLs**:
   - Go to your Supabase project → Authentication → URL Configuration
   - Add your production URL to "Redirect URLs": `https://yourdomain.com/**`
   - Add your production URL to "Site URL": `https://yourdomain.com`

3. **Build and deploy**:
   ```bash
   pnpm build
   pnpm start
   ```

### Platform-Specific Instructions

#### Vercel
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Connect your repository to Netlify
2. Build command: `pnpm build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

#### Other Platforms
- Ensure Node.js 18+ is available
- Set environment variables
- Run `pnpm build` and `pnpm start`
- The application will be available on the port specified by the `PORT` environment variable (default: 3000)

### Important Notes for Production

- ✅ The application uses `window.location.origin` as a fallback for redirect URLs, so it will work automatically in production
- ✅ All authentication redirects are handled server-side via middleware (`middleware.ts`)
- ✅ RLS policies ensure data security even with exposed anon key
- ✅ Make sure to configure Supabase redirect URLs in your Supabase dashboard
- ✅ The middleware automatically protects `/dashboard` routes and redirects unauthenticated users to login

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## License

This project is created for assessment purposes.

## Contributing

This is an assessment project. For questions or issues, please contact the repository owner.
