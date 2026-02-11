import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
  running: boolean;
}

const Timer = ({ seconds, onTimeUp, running }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft, onTimeUp]);

  const progress = (timeLeft / seconds) * 100;
  const isLow = timeLeft <= 10;

  return (
    <div className="timer-ring w-20 h-20 md:w-24 md:h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke={isLow ? "hsl(var(--primary))" : "hsl(var(--neon-glow))"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={264}
          strokeDashoffset={264 - (264 * progress) / 100}
          transition={{ duration: 0.5 }}
          className={isLow ? "animate-pulse" : ""}
        />
      </svg>
      <span className={`absolute font-display text-xl md:text-2xl font-bold ${isLow ? "text-primary neon-text" : "text-foreground"}`}>
        {timeLeft}
      </span>
    </div>
  );
};

export default Timer;
