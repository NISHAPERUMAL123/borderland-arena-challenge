import { motion } from "framer-motion";

const suits = [
  { symbol: "♣", name: "Clubs", color: "text-foreground" },
  { symbol: "♠", name: "Spades", color: "text-foreground" },
  { symbol: "♥", name: "Hearts", color: "text-primary" },
  { symbol: "♦", name: "Diamonds", color: "text-primary" },
];

interface SuitCardProps {
  suit: typeof suits[0];
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
}

const SuitCard = ({ suit, selected, locked, onSelect }: SuitCardProps) => {
  return (
    <motion.button
      onClick={onSelect}
      disabled={locked}
      className={`suit-card flex flex-col items-center justify-center p-6 md:p-8 aspect-[3/4] w-full max-w-[180px]
        ${selected ? "selected" : ""} ${locked ? "locked" : ""}`}
      whileHover={!locked ? { scale: 1.05 } : {}}
      whileTap={!locked ? { scale: 0.95 } : {}}
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <span className={`text-5xl md:text-7xl ${suit.color} mb-2`}>{suit.symbol}</span>
      <span className="font-display text-sm md:text-base text-muted-foreground uppercase tracking-widest">
        {suit.name}
      </span>
    </motion.button>
  );
};

interface SuitSelectorProps {
  selectedSuit: string | null;
  onSelect: (suit: string) => void;
}

const SuitSelector = ({ selectedSuit, onSelect }: SuitSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center">
      {suits.map((suit, i) => (
        <SuitCard
          key={suit.name}
          suit={suit}
          selected={selectedSuit === suit.name}
          locked={selectedSuit !== null && selectedSuit !== suit.name}
          onSelect={() => onSelect(suit.name)}
        />
      ))}
    </div>
  );
};

export default SuitSelector;
