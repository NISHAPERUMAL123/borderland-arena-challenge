import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { formatTime } from "@/lib/scoreboard";

const Results = () => {
  const navigate = useNavigate();
  const { state, resetGame, getActiveMembers } = useGame();
  const survivors = getActiveMembers();
  const won = survivors.length > 0;

  const handleRestart = () => {
    resetGame();
    navigate("/");
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-12">
      <motion.div
        className="glass-card p-8 md:p-12 max-w-lg w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className={`text-6xl md:text-8xl mb-6 ${won ? "" : "text-primary neon-text"}`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {won ? "🏆" : "💀"}
        </motion.div>

        <h1 className={`font-display text-3xl md:text-4xl font-black mb-2 ${won ? "text-green-400" : "text-primary neon-text"}`}>
          {won ? "VICTORY" : "GAME OVER"}
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-8">
          {won ? "Your team survived the Borderland Arena!" : "Your team was eliminated."}
        </p>

        {/* Score */}
        <div className="glass-card p-6 mb-6">
          <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Score</p>
          <p className="score-display text-4xl md:text-5xl text-primary">{state.totalScore}</p>
        </div>

        {/* Round breakdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {state.roundScores.map((score, i) => (
            <div key={i} className="glass-card p-3">
              <p className="font-display text-xs text-muted-foreground uppercase">R{i + 1}</p>
              <p className="font-display text-lg font-bold text-foreground">{score}</p>
              <p className="font-body text-xs text-muted-foreground">{formatTime(state.roundTimes[i] || 0)}</p>
            </div>
          ))}
        </div>

        {/* Survivors */}
        <div className="mb-8">
          <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">
            {won ? "Survivors" : "Fallen Members"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {state.members.map((member) => (
              <div
                key={member.id}
                className={`px-3 py-1.5 rounded-lg font-body text-sm ${
                  member.eliminated
                    ? "bg-muted text-muted-foreground line-through"
                    : "bg-primary/20 text-primary neon-border"
                }`}
              >
                {member.name}
              </div>
            ))}
          </div>
        </div>

        {state.gameSession && (
          <motion.button
            className="w-full py-3 mb-3 border border-primary/50 rounded-xl font-display text-sm uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
            onClick={() => navigate("/scoreboard")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            VIEW SCOREBOARD
          </motion.button>
        )}

        <motion.button
          className="btn-game w-full text-lg"
          onClick={handleRestart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          PLAY AGAIN
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Results;
