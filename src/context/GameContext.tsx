import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Question {
  id?: string;
  round_number: number;
  question_text: string;
  question_type: "multiple_choice" | "text";
  options: string[] | null;
  correct_answer: string;
  sort_order: number;
  session_id?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  eliminated: boolean;
}

export interface GameSession {
  id: string;
  game_code: string;
  is_active: boolean;
  created_at: string;
}

export interface GameState {
  teamName: string;
  members: TeamMember[];
  currentRound: number;
  score: number;
  totalScore: number;
  selectedSuit: string | null;
  roundScores: number[];
  gameStarted: boolean;
  gameOver: boolean;
  showElimination: boolean;
  eliminatedMember: string | null;
  currentQuestions: Question[];
  currentQuestionIndex: number;
  sessionQuestions: Question[];
  gameSession: GameSession | null;
}

interface GameContextType {
  state: GameState;
  setTeam: (name: string, members: string[]) => void;
  setGameSession: (session: GameSession, questions: Question[]) => void;
  selectSuit: (suit: string) => void;
  startRound: () => void;
  answerQuestion: (answer: string) => boolean;
  nextQuestion: () => void;
  finishRound: () => void;
  eliminateMember: () => string | null;
  dismissElimination: () => void;
  resetGame: () => void;
  getActiveMembers: () => TeamMember[];
}

const initialState: GameState = {
  teamName: "",
  members: [],
  currentRound: 0,
  score: 0,
  totalScore: 0,
  selectedSuit: null,
  roundScores: [],
  gameStarted: false,
  gameOver: false,
  showElimination: false,
  eliminatedMember: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  sessionQuestions: [],
  gameSession: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(initialState);

  const setGameSession = useCallback((session: GameSession, questions: Question[]) => {
    setState((prev) => ({ ...prev, gameSession: session, sessionQuestions: questions }));
  }, []);

  const setTeam = useCallback((name: string, members: string[]) => {
    setState((prev) => ({
      ...prev,
      teamName: name,
      members: members.map((m, i) => ({ id: `member-${i}`, name: m, eliminated: false })),
      gameStarted: true,
      currentRound: 1,
    }));
  }, []);

  const selectSuit = useCallback((suit: string) => {
    setState((prev) => ({ ...prev, selectedSuit: suit }));
  }, []);

  const startRound = useCallback(() => {
    const round = state.currentRound;
    // Use session questions if available, else fall back to empty
    const roundQuestions = state.sessionQuestions.filter((q) => q.round_number === round);
    // Shuffle and take 5
    const shuffled = [...roundQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setState((prev) => ({
      ...prev,
      currentQuestions: shuffled,
      currentQuestionIndex: 0,
      score: 0,
      selectedSuit: null,
    }));
  }, [state.currentRound, state.sessionQuestions]);

  const answerQuestion = useCallback((answer: string): boolean => {
    const q = state.currentQuestions[state.currentQuestionIndex];
    // Case-insensitive exact match
    const correct = q.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();
    if (correct) {
      setState((prev) => ({ ...prev, score: prev.score + 25 }));
    }
    return correct;
  }, [state.currentQuestions, state.currentQuestionIndex]);

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  }, []);

  const finishRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      totalScore: prev.totalScore + prev.score,
      roundScores: [...prev.roundScores, prev.score],
    }));
  }, []);

  const eliminateMember = useCallback((): string | null => {
    const active = state.members.filter((m) => !m.eliminated);
    if (active.length <= 1) return null;
    const victim = active[Math.floor(Math.random() * active.length)];
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === victim.id ? { ...m, eliminated: true } : m
      ),
      showElimination: true,
      eliminatedMember: victim.name,
    }));
    return victim.name;
  }, [state.members]);

  const dismissElimination = useCallback(() => {
    setState((prev) => {
      const nextRound = prev.currentRound + 1;
      const gameOver = nextRound > 4;
      return {
        ...prev,
        showElimination: false,
        eliminatedMember: null,
        currentRound: gameOver ? prev.currentRound : nextRound,
        gameOver,
        selectedSuit: null,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const getActiveMembers = useCallback(() => {
    return state.members.filter((m) => !m.eliminated);
  }, [state.members]);

  return (
    <GameContext.Provider
      value={{
        state,
        setTeam,
        setGameSession,
        selectSuit,
        startRound,
        answerQuestion,
        nextQuestion,
        finishRound,
        eliminateMember,
        dismissElimination,
        resetGame,
        getActiveMembers,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
