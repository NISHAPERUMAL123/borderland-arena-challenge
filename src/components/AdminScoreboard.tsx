import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSessionScoreboard, formatTime, type TeamSummary } from "@/lib/scoreboard";

interface Props {
  sessionId: string;
}

const AdminScoreboard = ({ sessionId }: Props) => {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getSessionScoreboard(sessionId);
      setTeams(data);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("admin-scoreboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_results", filter: `session_id=eq.${sessionId}` }, () => {
        getSessionScoreboard(sessionId).then(setTeams);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  if (loading) {
    return <p className="text-muted-foreground font-body text-sm animate-pulse">Loading scoreboard...</p>;
  }

  if (teams.length === 0) {
    return <p className="text-muted-foreground font-body text-sm">No teams have submitted scores yet.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_80px_80px] md:grid-cols-[auto_1fr_80px_80px_repeat(4,60px)] gap-2 px-4 text-xs font-display uppercase tracking-wider text-muted-foreground">
        <span>#</span>
        <span>Team</span>
        <span className="text-right">Score</span>
        <span className="text-right">Time</span>
        <span className="hidden md:block text-center">R1</span>
        <span className="hidden md:block text-center">R2</span>
        <span className="hidden md:block text-center">R3</span>
        <span className="hidden md:block text-center">R4</span>
      </div>

      {teams.map((team, idx) => (
        <motion.div
          key={team.team_name}
          className={`glass-card grid grid-cols-[auto_1fr_80px_80px] md:grid-cols-[auto_1fr_80px_80px_repeat(4,60px)] gap-2 px-4 py-3 items-center ${idx === 0 ? "neon-border" : ""}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <span className={`font-display font-bold text-sm ${idx === 0 ? "text-primary" : "text-muted-foreground"}`}>
            {idx + 1}
          </span>
          <span className="font-body text-sm text-foreground truncate">{team.team_name}</span>
          <span className="font-display text-sm font-bold text-primary text-right">{team.totalScore}</span>
          <span className="font-body text-xs text-muted-foreground text-right">{formatTime(team.totalTime)}</span>
          {[1, 2, 3, 4].map((r) => {
            const round = team.rounds.find((rd) => rd.round === r);
            return (
              <span key={r} className="hidden md:block text-center font-body text-xs text-muted-foreground">
                {round ? `${round.score}` : "—"}
              </span>
            );
          })}
        </motion.div>
      ))}

      <p className="text-xs text-muted-foreground font-body text-center mt-2">
        Tiebreaker: fastest total time wins when scores are equal
      </p>
    </div>
  );
};

export default AdminScoreboard;
