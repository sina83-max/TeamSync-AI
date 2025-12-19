"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function randomizeTeams() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can randomize teams.");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email");

  if (error) {
    console.error("Failed to fetch profiles for randomization:", error);
    throw new Error("Unable to fetch profiles for team randomization.");
  }

  if (!profiles || profiles.length === 0) {
    throw new Error("No profiles to randomize into teams.");
  }

  // Shuffle profiles
  const shuffled = [...profiles].sort(() => Math.random() - 0.5);

  // Chunk into groups of 3
  const groups: typeof profiles[] = [];
  for (let i = 0; i < shuffled.length; i += 3) {
    groups.push(shuffled.slice(i, i + 3));
  }

  // For each group, create a team and assign members
  for (const [index, group] of groups.entries()) {
    const teamName = `Squad ${index + 1}`;

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name: teamName })
      .select("id")
      .single();

    if (teamError || !team) {
      console.error("Failed to create team:", teamError);
      throw new Error("Unable to create team during randomization.");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ team_id: team.id })
      .in(
        "id",
        group.map((p) => p.id)
      );

    if (updateError) {
      console.error("Failed to assign profiles to team:", updateError);
      throw new Error("Unable to assign profiles to team during randomization.");
    }
  }
}


