import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Trophy } from "lucide-react";

export async function Leaderboard() {
    const supabase = await createServerSupabaseClient();

    const { data: submissions } = await supabase
        .from("submissions")
        .select(`
      ai_score,
      project_name,
      teams (
        name
      )
    `)
        .order("ai_score", { ascending: false })
        .limit(5);

    if (!submissions || submissions.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-zinc-50">Hall of Fame</h3>
            </div>
            <div className="space-y-3">
                {submissions.map((sub: any, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/20 px-4 py-3"
                    >
                        <div>
                            <p className="font-medium text-zinc-200">{sub.project_name}</p>
                            <p className="text-xs text-zinc-500">{sub.teams?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-400">
                                {sub.ai_score}
                            </span>
                            <span className="text-xs text-zinc-600">/ 100</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
