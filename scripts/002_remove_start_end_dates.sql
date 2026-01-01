-- Remove start_date and end_date columns from tasks table
ALTER TABLE public.tasks DROP COLUMN IF EXISTS start_date;
ALTER TABLE public.tasks DROP COLUMN IF EXISTS end_date;
