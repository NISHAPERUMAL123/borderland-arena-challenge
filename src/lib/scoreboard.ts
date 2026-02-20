import { supabase } from "@/integrations/supabase/client";

export interface TeamResult {
  id: string;
  session_id: string;
  team_name: string;
  round_number: number;
  score: number;
  time_spent_seconds: number;
  created_at: string;
}

export interface TeamSummary {
  team_name: string;
  totalScore: number;
  totalTime: number;
  rounds: { round: number; score: number; time: number }[];
}

export async function saveRoundResult(
  sessionId: string,
  teamName: string,
  roundNumber: number,
  score: number,
  timeSpentSeconds: number
) {
  const { error } = await supabase.from("team_results").insert({
    session_id: sessionId,
    team_name: teamName,
    round_number: roundNumber,
    score,
    time_spent_seconds: timeSpentSeconds,
  });
  return { error };
}

export async function getSessionScoreboard(sessionId: string): Promise<TeamSummary[]> {
  const { data, error } = await supabase
    .from("team_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("round_number");

  if (error || !data) return [];

  const teams = new Map<string, TeamSummary>();

  for (const row of data) {
    if (!teams.has(row.team_name)) {
      teams.set(row.team_name, { team_name: row.team_name, totalScore: 0, totalTime: 0, rounds: [] });
    }
    const t = teams.get(row.team_name)!;
    t.totalScore += row.score;
    t.totalTime += Number(row.time_spent_seconds);
    t.rounds.push({ round: row.round_number, score: row.score, time: Number(row.time_spent_seconds) });
  }

  // Sort: highest score first, then lowest total time as tiebreaker
  return Array.from(teams.values()).sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.totalTime - b.totalTime; // faster wins
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
