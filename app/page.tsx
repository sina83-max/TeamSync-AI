import Link from "next/link";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VibeCheckPanel } from "@/components/vibe-check-panel";
import { randomizeTeams } from "@/app/actions/randomize-teams";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  team_id: string | null;
};

type Team = {
  id: string;
  name: string;
};

async function getDashboardData() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      team: null,
      teammates: [] as Profile[],
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, team_id")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile || !profile.team_id) {
    return {
      user,
      profile,
      team: null,
      teammates: [] as Profile[],
    };
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", profile.team_id)
    .maybeSingle<Team>();

  const { data: teammates = [] } = await supabase
    .from("profiles")
    .select("id, email, full_name, team_id")
    .eq("team_id", profile.team_id);

  return {
    user,
    profile,
    team,
    teammates: teammates as Profile[],
  };
}

export default async function Home() {
  const { user, profile, team, teammates } = await getDashboardData();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            TeamSync AI
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Cyber-productive teams, AI-powered vibe checks, zero meeting chaos.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="hidden rounded-full border border-zinc-800 bg-zinc-950/40 px-4 py-1 text-xs font-medium uppercase tracking-wide text-zinc-300 shadow-[0_0_25px_rgba(129,140,248,0.4)] sm:block">
            Vibe Judge: Online
          </div>
          <div className="flex items-center gap-2">
            <form action={randomizeTeams}>
              <Button
                type="submit"
                variant="outline"
                className="border-indigo-500/60 bg-zinc-950/60 text-xs font-semibold text-indigo-200 hover:bg-zinc-900 hover:text-indigo-100"
              >
                Randomize teams
              </Button>
            </form>
            {user && profile ? (
              <UserProfile email={profile.email} fullName={profile.full_name} />
            ) : (
              <Link href="/auth">
                <Button className="text-xs font-semibold">
                  Sign in / Sign up
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <Card className="border-zinc-800/80 bg-zinc-950/60 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-zinc-50">
              <span>Your team</span>
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-indigo-500/70 shadow-[0_0_18px_rgba(129,140,248,0.7)]">
                {team ? "Synced" : "Awaiting assignment"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user && (
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  You&apos;re not signed in yet. Once you log in, we&apos;ll
                  drop you into a squad of three and keep everyone in sync.
                </p>
              </div>
            )}

            {user && !team && (
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="font-medium text-zinc-200">
                  No team… yet. You&apos;re currently in the lobby.
                </p>
                <p>
                  When the randomizer runs, you&apos;ll be assigned to a
                  high-signal trio. Until then, enjoy the quiet.
                </p>
              </div>
            )}

            {user && team && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Current squad
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-50">
                    {team.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Members
                  </p>
                  <ul className="space-y-1.5">
                    {teammates.map((mate) => (
                      <li
                        key={mate.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-zinc-100">
                          {mate.full_name || mate.email}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {mate.id === user.id ? "You" : "Teammate"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {!user && (
              <div className="mt-4 h-16 animate-pulse rounded-xl bg-zinc-900/60" />
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-950/70 shadow-[0_0_45px_rgba(37,99,235,0.45)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-zinc-50">
              <span>Project vibe check</span>
              <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/70 shadow-[0_0_20px_rgba(129,140,248,0.8)]">
                Live
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VibeCheckPanel />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
