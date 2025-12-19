-- Add role column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create submissions table if it doesn't exist (re-affirming schema.sql)
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  created_by uuid references public.profiles(id),
  project_name text not null,
  project_description text not null,
  ai_questions jsonb,
  ai_score numeric(5,2),
  ai_verdict text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Policy to allow anyone to read submissions (for leaderboard)
CREATE POLICY "Public submissions are viewable by everyone."
  ON public.submissions FOR SELECT
  USING ( true );

-- Policy to allow authenticated users to insert submissions
CREATE POLICY "Users can insert submissions."
  ON public.submissions FOR INSERT
  WITH CHECK ( auth.uid() = created_by );

-- Set the first user as admin (optional, user can manually update)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
