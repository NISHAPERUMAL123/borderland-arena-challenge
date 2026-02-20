import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import type { Question } from "@/context/GameContext";
import SuitSelector from "@/components/SuitSelector";
import MemberList from "@/components/MemberList";
import Timer from "@/components/Timer";
import EliminationOverlay from "@/components/EliminationOverlay";
import { saveRoundResult, formatTime } from "@/lib/scoreboard";

const roundNames = ["", "Entry Game", "Mind Trap", "Betrayal Stage", "Final Showdown"];
const roundDescriptions = [
  "",
  "Logic puzzles & pattern recognition",
  "Reverse coding & logic riddles",
  "Coding challenges & reverse code",
  "Final round — type your answers",
];

const GameDashboard = () => {
  const navigate = useNavigate();
  const { state, selectSuit, startRound, answerQuestion, nextQuestion, finishRound, eliminateMember, dismissElimination, getActiveMembers } = useGame();
  const [phase, setPhase] = useState<"select" | "playing" | "results">("select");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [roundFinished, setRoundFinished] = useState(false);
  const [textInput, setTextInput] = useState("");

  const isTextRound = state.currentRound === 4;

  const handleSuitSelect = (suit: string) => {
    selectSuit(suit);
    startRound();
    setTimeout(() => setPhase("playing"), 800);
  };

  const submitAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answerQuestion(answer);
    setAnswerCorrect(correct);

    setTimeout(() => {
      setSelectedAnswer(null);
      setAnswerCorrect(null);
      setTextInput("");
      if (state.currentQuestionIndex + 1 >= state.currentQuestions.length) {
        finishRound();
        setRoundFinished(true);
        setPhase("results");
      } else {
        nextQuestion();
      }
    }, 1200);
  };

  const handleAnswer = (answer: string) => submitAnswer(answer);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || selectedAnswer) return;
    submitAnswer(textInput.trim());
  };

  const handleTimeUp = useCallback(() => {
    if (phase === "playing" && !selectedAnswer) {
      setTextInput("");
      if (state.currentQuestionIndex + 1 >= state.currentQuestions.length) {
        finishRound();
        setRoundFinished(true);
        setPhase("results");
      } else {
        nextQuestion();
      }
    }
  }, [phase, selectedAnswer, state.currentQuestionIndex, state.currentQuestions.length, finishRound, nextQuestion]);

  const handlePostRound = async () => {
    // Save round result to DB
    if (state.gameSession?.id) {
      const lastRoundTime = state.roundTimes[state.roundTimes.length - 1] || 0;
      await saveRoundResult(
        state.gameSession.id,
        state.teamName,
        state.currentRound,
        state.score,
        lastRoundTime
      );
    }

    const elimThreshold = 50;
    const elimCount = state.currentRound === 3 || state.currentRound === 4 ? 2 : 1;

    if (state.score < elimThreshold) {
      for (let i = 0; i < elimCount; i++) {
        eliminateMember();
      }
    } else {
      dismissElimination();
      if (state.currentRound >= 4) {
        navigate("/results");
      } else {
        setPhase("select");
        setRoundFinished(false);
      }
    }
  };

  const handleDismissElimination = () => {
    dismissElimination();
    if (state.gameOver || state.currentRound >= 4) {
      navigate("/results");
    } else {
      setPhase("select");
      setRoundFinished(false);
    }
  };

  if (!state.gameStarted) {
    navigate("/");
    return null;
  }

  const currentQ: Question | undefined = state.currentQuestions[state.currentQuestionIndex];
  const activeMembers = getActiveMembers();

  return (
    <div className="min-h-screen animated-bg px-4 py-6 md:py-10">
      {state.showElimination && state.eliminatedMember && (
        <EliminationOverlay memberName={state.eliminatedMember} onDismiss={handleDismissElimination} />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-primary neon-text">BORDERLAND ARENA</h1>
            <p className="font-body text-muted-foreground">{state.teamName}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-xs text-muted-foreground uppercase tracking-wider">Round</p>
              <p className="font-display text-2xl font-bold text-primary">{state.currentRound}/4</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xs text-muted-foreground uppercase tracking-wider">Score</p>
              <p className="score-display text-primary">{state.totalScore + state.score}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xs text-muted-foreground uppercase tracking-wider">Alive</p>
              <p className="font-display text-2xl font-bold text-foreground">{activeMembers.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Members */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <MemberList members={state.members} />
        </motion.div>

        {/* Round name */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">{roundNames[state.currentRound]}</h2>
          <p className="text-muted-foreground font-body">{roundDescriptions[state.currentRound]}</p>
          {isTextRound && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-display text-xs uppercase tracking-wider">
              Type Your Answer
            </span>
          )}
        </motion.div>

        {/* Card Selection Phase */}
        {phase === "select" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-center text-muted-foreground font-body mb-6 text-lg">Choose your card to begin</p>
            <SuitSelector selectedSuit={state.selectedSuit} onSelect={handleSuitSelect} />
          </motion.div>
        )}

        {/* Playing Phase */}
        {phase === "playing" && currentQ && (
          <motion.div
            className="glass-card p-6 md:p-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={currentQ.id || currentQ.sort_order}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                Question {state.currentQuestionIndex + 1}/{state.currentQuestions.length}
              </span>
              <Timer seconds={30} onTimeUp={handleTimeUp} running={!selectedAnswer} />
            </div>

            <p className="font-body text-lg md:text-xl text-foreground mb-8 leading-relaxed">
              {currentQ.question_text}
            </p>

            {/* Multiple Choice */}
            {currentQ.question_type === "multiple_choice" && currentQ.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((option) => {
                  let optionClass = "glass-card p-4 text-left font-body text-base transition-all duration-300 cursor-pointer hover:neon-glow hover:border-primary/40";
                  if (selectedAnswer) {
                    if (option === currentQ.correct_answer) {
                      optionClass = "glass-card p-4 text-left font-body text-base border-emerald-500/80 bg-emerald-500/10";
                    } else if (option === selectedAnswer && !answerCorrect) {
                      optionClass = "glass-card p-4 text-left font-body text-base border-primary/80 bg-primary/10";
                    } else {
                      optionClass = "glass-card p-4 text-left font-body text-base opacity-40";
                    }
                  }
                  return (
                    <motion.button
                      key={option}
                      className={optionClass}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                      whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Text Input */}
            {currentQ.question_type === "text" && (
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={!!selectedAnswer}
                  placeholder="Type your answer here..."
                  autoFocus
                  className={`w-full bg-secondary/50 border rounded-lg px-4 py-3 text-foreground font-body text-lg
                    focus:outline-none focus:ring-1 transition-colors placeholder:text-muted-foreground/50
                    ${selectedAnswer
                      ? answerCorrect
                        ? "border-emerald-500/80 bg-emerald-500/10"
                        : "border-primary/80 bg-primary/10"
                      : "border-border focus:border-primary focus:ring-primary/50"
                    }`}
                />
                {selectedAnswer && (
                  <p className={`text-sm font-body text-center ${answerCorrect ? "text-emerald-400" : "text-primary"}`}>
                    {answerCorrect ? "✓ Correct!" : `✗ Correct answer: ${currentQ.correct_answer}`}
                  </p>
                )}
                <motion.button
                  type="submit"
                  disabled={!!selectedAnswer || !textInput.trim()}
                  className="btn-game w-full disabled:opacity-50"
                  whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                  whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                >
                  SUBMIT ANSWER
                </motion.button>
              </form>
            )}

            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                {state.currentQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === state.currentQuestionIndex ? "bg-primary neon-glow" :
                      i < state.currentQuestionIndex ? "bg-primary/50" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Phase */}
        {phase === "results" && roundFinished && (
          <motion.div
            className="glass-card p-6 md:p-10 max-w-lg mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">Round Complete</h3>
            <p className="score-display text-4xl md:text-5xl text-primary my-6">{state.score}</p>
            <p className="text-muted-foreground font-body mb-2">out of {state.currentQuestions.length * 25} points</p>

            {state.score < 50 ? (
              <p className="text-primary font-display text-sm uppercase tracking-wider mb-6">
                Score too low — elimination incoming {(state.currentRound === 3 || state.currentRound === 4) ? "(2 members)" : "(1 member)"}
              </p>
            ) : (
              <p className="text-emerald-400 font-display text-sm uppercase tracking-wider mb-6">
                Score sufficient — no elimination!
              </p>
            )}

            <motion.button
              className="btn-game"
              onClick={handlePostRound}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {state.score < 50 ? "FACE JUDGMENT" : "CONTINUE"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameDashboard;
