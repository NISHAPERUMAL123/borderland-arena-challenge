import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getActiveSession, getSessionQuestions } from "@/lib/supabase";
import { useGame, type Question } from "@/context/GameContext";

const CodeEntry = () => {
  const navigate = useNavigate();
  const { setGameSession } = useGame();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      setError("Enter a valid game code.");
      return;
    }
    setLoading(true);
    const { data: session, error: sessionError } = await getActiveSession(trimmed);
    if (sessionError || !session) {
      setError("Invalid or expired game code. Ask your admin for the active code.");
      setLoading(false);
      return;
    }
    const { data: questions, error: qError } = await getSessionQuestions(session.id);
    if (qError || !questions || questions.length === 0) {
      setError("No questions found for this session. Ask admin to set up questions.");
      setLoading(false);
      return;
    }
    const typedQuestions = questions.map((q) => ({
      ...q,
      question_type: q.question_type as Question["question_type"],
      options: q.options as string[] | null,
    }));
    setGameSession(session, typedQuestions);
    navigate("/setup");
    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-12">
      <motion.div
        className="glass-card p-8 md:p-12 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating suits */}
        {["♠", "♥", "♣", "♦"].map((suit, i) => (
          <motion.span
            key={suit}
            className="absolute text-4xl text-primary/10 font-bold select-none pointer-events-none"
            style={{ top: `${15 + i * 20}%`, left: i % 2 === 0 ? "5%" : "88%" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.5 }}
          >{suit}</motion.span>
        ))}

        <motion.div className="text-5xl mb-4" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          🃏
        </motion.div>
        <h1 className="font-display text-3xl md:text-4xl font-black text-primary neon-text mb-2">BORDERLAND ARENA</h1>
        <p className="text-muted-foreground font-body mb-8">Enter your game code to join the arena</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="ENTER CODE"
            maxLength={8}
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-4 text-foreground font-display text-2xl tracking-[0.4em] text-center
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/30 placeholder:text-lg placeholder:tracking-normal"
          />
          {error && <p className="text-primary text-sm font-body">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            className="btn-game w-full text-lg disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "VERIFYING..." : "ENTER THE ARENA"}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/40">
          <button
            onClick={() => navigate("/admin-login")}
            className="text-muted-foreground font-body text-sm hover:text-primary transition-colors"
          >
            Admin? Login here →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeEntry;
