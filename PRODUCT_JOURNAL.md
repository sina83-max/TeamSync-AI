 [2025-12-18 12:48:36 UTC] Project Scaffolding & UI Baseline

Goal: Set up the foundational Next.js 14 App Router project with TypeScript, Tailwind CSS, and Shadcn/UI so we can quickly build the TeamSync AI experience.

Tech Decision: Used `create-next-app` with the App Router, TypeScript, and Tailwind template for speed, then initialized Shadcn/UI (with base Neutral/Zinc-like palette) and added core primitives (Button, Card, Input, Label, Textarea) to match the “cyber-productivity” dark theme and enable rapid UI composition.

AI Prompt Workflow: No AI wired up yet; this step only prepares the frontend stack so later we can route user project data to Gemini for analysis and grading via dedicated API routes.

[2025-12-18 13:09:02 UTC] Supabase Client Setup

Goal: Configure reusable Supabase helpers for server components/actions and any client-side interactions so auth and data access are consistent across TeamSync AI.

Tech Decision: Created lightweight wrappers `createServerSupabaseClient` and `createBrowserSupabaseClient` using `@supabase/ssr`, wired to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, with cookie-based session handling on the server to align with Next.js App Router best practices.

AI Prompt Workflow: No AI logic invoked here; this layer simply standardizes how future features (team randomizer and vibe-check flows) will read/write project, team, and submission data that will later be passed into Gemini prompts.

[2025-12-18 13:09:02 UTC] Database Schema: Profiles, Teams, Submissions

Goal: Design a minimal but flexible schema to support user profiles, randomized teams of three, and AI-evaluated project submissions.

Tech Decision: Created `profiles` (1:1 with `auth.users`, plus optional `team_id`), `teams` (randomized groups), and `submissions` (per-team project submissions with JSONB `ai_questions`, numeric `ai_score`, and text `ai_verdict`), structured to allow easy querying of a user’s team and their latest AI-scored project.

AI Prompt Workflow: This schema anticipates a two-step AI pipeline where submissions store the original project description, Gemini-generated questions, and later the score and verdict so prompts can evolve over time without losing historical grading data.


