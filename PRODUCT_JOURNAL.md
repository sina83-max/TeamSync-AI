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

[2025-12-18 13:51:05 UTC] Dashboard UI: Team & Vibe Check Shell

Goal: Replace the default landing page with a dark, “cyber-productivity” dashboard that surfaces the user’s team context and a clear entry point into the project vibe-check flow.

Tech Decision: Updated the root layout to default to dark mode with a zinc/indigo gradient background, and built the home page as a server component that reads the current user, profile, and team from Supabase (when available), rendering team cards, glowing status badges, and a prominent “Submit project” CTA using Shadcn `Card` and `Button` primitives.

AI Prompt Workflow: The dashboard currently only hosts the UX surface for future AI flows; once wired, the “Submit project” entry point will collect project metadata and route it into Gemini-powered analysis and grading, with scores and verdicts persisted back into the `submissions` table.

[2025-12-18 13:54:30 UTC] Gemini Vibe-Check API

Goal: Expose a backend API that lets the frontend run the two-step vibe-check flow: first generating project-specific questions, then grading the team’s answers with a score and verdict.

Tech Decision: Added a `POST /api/vibe-check` route that uses the `@google/generative-ai` SDK with the `gemini-1.5-flash` model and a simple `mode` switch—`questions` returns three sharp, JSON-encoded questions, while `grade` returns a numeric 0–100 score plus a one-paragraph verdict in JSON, with fallbacks if the model’s response isn’t perfectly formatted.

AI Prompt Workflow: For `mode: "questions"`, the prompt instructs Gemini to generate exactly three targeted questions tailored to the provided project name and 2-sentence description; for `mode: "grade"`, it feeds the project context and the team’s answers into a “professional but witty” judge prompt that outputs a score and verdict, which the frontend will later store alongside submissions in the database.

[2025-12-18 13:58:03 UTC] Frontend Vibe Check Flow

Goal: Connect the dashboard UI to the Gemini vibe-check API so users can describe a project, answer AI-generated questions, and immediately see a score and verdict.

Tech Decision: Introduced a `VibeCheckPanel` client component that manages a minimal three-phase state machine (`describe` → `answer` → `result`), calling `/api/vibe-check` with `mode: "questions"` to fetch tailored questions and then `mode: "grade"` to retrieve a 0–100 score and verdict, all wrapped in a Shadcn card on the right side of the dashboard.

AI Prompt Workflow: The panel first sends the project name and 2-sentence description to Gemini to generate three sharp questions, then later sends those answers plus the same project context back for grading; the responses are rendered as a glowing score badge and a witty-but-professional paragraph, giving the user a tight feedback loop without leaving the dashboard.

[2025-12-18 14:09:09 UTC] Team Randomizer

Goal: Implement a simple way to split all users into squads of three and attach them to `teams` so the dashboard can surface real team groupings.

Tech Decision: Added a `randomizeTeams` server action that fetches all `profiles`, shuffles them, chunks into groups of three, creates `teams` records (e.g. “Squad 1”), and bulk-updates each group’s `team_id`, wired to a `Randomize teams` button in the dashboard header for quick rebalancing during development.

AI Prompt Workflow: This feature doesn’t call Gemini directly, but it sets up the team structures that future vibe-check submissions will be associated with, letting us eventually analyze scores and verdicts at the squad level.

[2025-12-18 14:11:08 UTC] Supabase Email/Password Auth (UI Shell)

Goal: Provide a minimal, in-dashboard way for users to sign up and sign in with email/password so the experience can start tying teams and submissions to real accounts.

Tech Decision: Added an `AuthPanel` client component that uses the browser Supabase client to handle email/password `signUp` and `signInWithPassword`, exposed inline in the header next to the “Randomize teams” control, with a lightweight mode toggle between sign-in and sign-up and a simple reload after successful sign-in so server components can see the session.

AI Prompt Workflow: Authentication isn’t part of the Gemini conversation, but it’s a prerequisite so that future vibe-check runs and scores can be associated with specific authenticated users and their teams instead of anonymous sessions.

[2025-12-18 14:16:54 UTC] Dedicated Auth Page

Goal: Move authentication into its own focused screen so the dashboard header stays clean while giving users a clear place to sign up or sign in.

Tech Decision: Updated the compact `AuthPanel` to a full-height form and created an `/auth` page that wraps it in a Shadcn `Card` with the same cyber-productivity styling, while the dashboard header now simply links to `/auth` via a “Sign in / Sign up” button next to the team randomizer.

AI Prompt Workflow: Still unchanged—auth remains an enabler so that, once wired fully, vibe-check submissions and scores can be tied to authenticated users and their teams, which later allows per-user and per-squad AI insights.

[2025-12-18 17:05:26 UTC] User Profile Dropdown & Logout

Goal: Replace the static "Sign in / Sign up" button with a dynamic user profile dropdown when authenticated, showing user details and providing a logout action so users can manage their session from the dashboard.

Tech Decision: Added a `UserProfile` client component using Shadcn's `DropdownMenu` that conditionally renders in the dashboard header when `user` and `profile` exist, displaying the user's name (or email prefix if no full name) and email in the dropdown label, with a "Log out" menu item that calls `supabase.auth.signOut()` and redirects to `/auth`; the header now conditionally shows either the profile dropdown or the sign-in link based on authentication state.

AI Prompt Workflow: No AI logic here—this is purely UX polish so authenticated users can see their identity and cleanly exit their session, which improves the overall experience before they start submitting projects for AI evaluation.

[2025-12-18 17:16:21 UTC] Migration from Google Gemini to Groq

Goal: Switch the AI model provider from Google Gemini to Groq for faster inference and better free-tier availability.

Tech Decision: Replaced `@google/generative-ai` SDK with `groq-sdk`, updated the API route to use Groq's chat completions API with the `llama-3.1-70b-versatile` model, changed environment variable from `GEMINI_API_KEY` to `GROQ_API_KEY`, and updated the API calls to use Groq's `chat.completions.create()` method with JSON response format for structured outputs.

AI Prompt Workflow: The prompts remain identical—Groq's Llama model receives the same project context and generates the same three-question format for the questions mode, and the same score + verdict JSON structure for the grade mode, maintaining the "professional but witty" tone while benefiting from Groq's faster inference speeds.


