import { motion, AnimatePresence } from "framer-motion";

interface EliminationOverlayProps {
  memberName: string;
  onDismiss: () => void;
}

const EliminationOverlay = ({ memberName, onDismiss }: EliminationOverlayProps) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center px-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* Skull / X icon */}
          <motion.div
            className="text-8xl md:text-9xl mb-6 text-primary neon-text"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
            transition={{ repeat: 3, duration: 0.5 }}
          >
            ✕
          </motion.div>

          <motion.h2
            className="font-display text-3xl md:text-5xl font-bold text-primary neon-text mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ELIMINATED
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-foreground font-body mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-primary font-bold">{memberName}</span> has been removed from the arena.
          </motion.p>

          <motion.button
            className="btn-game"
            onClick={onDismiss}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EliminationOverlay;
