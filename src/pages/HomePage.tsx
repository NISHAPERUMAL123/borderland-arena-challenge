import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  const rules = [
    "Form a team of 5–6 members",
    "Each round, choose a card suit to reveal your challenge",
    "Answer questions under time pressure",
    "Low scores result in member elimination",
    "Survive all 3 rounds to win the game",
  ];

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      {/* Floating suit symbols */}
      <motion.span
        className="absolute top-20 left-10 text-6xl text-primary/10 font-bold select-none"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >♠</motion.span>
      <motion.span
        className="absolute bottom-20 right-10 text-6xl text-primary/10 font-bold select-none"
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      >♥</motion.span>
      <motion.span
        className="absolute top-40 right-20 text-5xl text-primary/10 font-bold select-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
      >♦</motion.span>
      <motion.span
        className="absolute bottom-40 left-20 text-5xl text-primary/10 font-bold select-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, delay: 1.5 }}
      >♣</motion.span>

      <motion.div
        className="text-center max-w-2xl z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="font-display text-5xl md:text-7xl font-black text-primary neon-text mb-4 animate-flicker"
        >
          BORDERLAND
        </motion.h1>
        <motion.h1
          className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ARENA
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground font-body tracking-wider uppercase mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Survival Tech Challenge
        </motion.p>

        <motion.button
          className="btn-game text-lg md:text-xl px-12 py-4 mb-12"
          onClick={() => navigate("/setup")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          START GAME
        </motion.button>

        {/* Rules */}
        <motion.div
          className="glass-card p-6 md:p-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="font-display text-lg text-primary mb-4 uppercase tracking-wider">Rules of the Arena</h3>
          <ul className="space-y-3">
            {rules.map((rule, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 text-foreground/80 font-body text-base md:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className="text-primary font-display text-sm mt-1">{String(i + 1).padStart(2, "0")}</span>
                {rule}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;
