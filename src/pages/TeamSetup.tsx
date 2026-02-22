import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";

const TeamSetup = () => {
  const navigate = useNavigate();
  const { setTeam, state } = useGame();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<string[]>([""]);
  const [error, setError] = useState("");

  const addMember = () => {
    if (members.length < 6) setMembers([...members, ""]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleStart = () => {
    const trimmedName = teamName.trim();
    const validMembers = members.map((m) => m.trim()).filter(Boolean);
    if (!trimmedName) {
      setError("Enter a team name");
      return;
    }
    if (validMembers.length < 3) {
      setError("Add at least 3 members");
      return;
    }
    setTeam(trimmedName, validMembers);
    navigate("/game");
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-12">
      <motion.div
        className="glass-card p-6 md:p-10 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Show Game Code */}
        {state.gameSession && (
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Game Code</p>
            <span className="font-display text-3xl md:text-4xl font-black text-primary neon-text tracking-[0.3em]">
              {state.gameSession.game_code}
            </span>
          </motion.div>
        )}

        <h2 className="font-display text-2xl md:text-3xl font-bold text-primary neon-text mb-2 text-center">
          TEAM SETUP
        </h2>
        <p className="text-muted-foreground text-center font-body mb-8">Assemble your team for the arena</p>

        {/* Team name */}
        <div className="mb-6">
          <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => { setTeamName(e.target.value); setError(""); }}
            placeholder="Enter team name..."
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground font-body text-lg
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Members */}
        <div className="mb-6">
          <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Members ({members.length}/6)
          </label>
          <AnimatePresence>
            {members.map((member, i) => (
              <motion.div
                key={i}
                className="flex gap-2 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-8 h-10 flex items-center justify-center rounded bg-primary/20 text-primary font-display text-xs shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <input
                  type="text"
                  value={member}
                  onChange={(e) => { updateMember(i, e.target.value); setError(""); }}
                  placeholder={`Member ${i + 1}`}
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground font-body
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
                />
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="w-10 h-10 flex items-center justify-center rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {members.length < 6 && (
            <button
              onClick={addMember}
              className="w-full mt-2 py-2 border border-dashed border-border rounded-lg text-muted-foreground font-body
                hover:border-primary/50 hover:text-primary transition-colors"
            >
              + Add Member
            </button>
          )}
        </div>

        {error && (
          <p className="text-primary text-sm font-body mb-4 text-center">{error}</p>
        )}

        {/* Preview */}
        {members.some((m) => m.trim()) && (
          <div className="mb-6">
            <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">Team Preview</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {members.filter((m) => m.trim()).map((m, i) => (
                <motion.div
                  key={i}
                  className="member-card !p-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: i * 0.05 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-display text-sm font-bold mx-auto mb-1 neon-border">
                    {m.trim().charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-body text-foreground truncate max-w-[60px]">{m.trim()}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.button
          className="btn-game w-full text-lg"
          onClick={handleStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ENTER THE ARENA
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TeamSetup;
