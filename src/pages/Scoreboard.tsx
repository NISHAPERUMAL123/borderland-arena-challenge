import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { getSessionScoreboard, formatTime, type TeamSummary } from "@/lib/scoreboard";
import { supabase } from "@/integrations/supabase/client";

const Scoreboard = () => {
  const navigate = useNavigate();
  const { state } = useGame();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionId = state.gameSession?.id;

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const load = async () => {
      const data = await getSessionScoreboard(sessionId);
      setTeams(data);
      setLoading(false);
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel("scoreboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_results", filter: `session_id=eq.${sessionId}` }, () => {
        getSessionScoreboard(sessionId).then(setTeams);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <p className="text-primary font-display text-xl animate-pulse">LOADING SCOREBOARD...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg px-4 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-black text-primary neon-text mb-2">SCOREBOARD</h1>
          <p className="text-muted-foreground font-body">Live rankings • Tiebreaker: fastest total time wins</p>
        </motion.div>

        {teams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
            <p className="text-muted-foreground font-body">No teams have submitted scores yet.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {teams.map((team, idx) => (
              <motion.div
                key={team.team_name}
                className={`glass-card p-4 md:p-6 ${idx === 0 ? "neon-border" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg font-bold ${
                    idx === 0 ? "bg-primary text-primary-foreground" :
                    idx === 1 ? "bg-primary/30 text-primary" :
                    idx === 2 ? "bg-primary/15 text-primary/70" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold text-foreground">{team.team_name}</p>
                    <p className="text-muted-foreground font-body text-xs">
                      {team.rounds.length} round{team.rounds.length !== 1 ? "s" : ""} played • Total time: {formatTime(team.totalTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="score-display text-2xl md:text-3xl text-primary">{team.totalScore}</p>
                    <p className="font-display text-xs text-muted-foreground uppercase">points</p>
                  </div>
                </div>

                {/* Round breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((r) => {
                    const round = team.rounds.find((rd) => rd.round === r);
                    return (
                      <div key={r} className={`rounded-lg p-2 text-center ${round ? "bg-secondary/50" : "bg-muted/30"}`}>
                        <p className="font-display text-xs text-muted-foreground">R{r}</p>
                        {round ? (
                          <>
                            <p className="font-display text-sm font-bold text-foreground">{round.score}</p>
                            <p className="font-body text-xs text-muted-foreground">{formatTime(round.time)}</p>
                          </>
                        ) : (
                          <p className="font-body text-xs text-muted-foreground">—</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigate("/results")}
            className="text-muted-foreground font-body text-sm hover:text-primary transition-colors underline underline-offset-4"
          >
            ← Back to Results
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Scoreboard;
