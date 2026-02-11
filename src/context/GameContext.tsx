import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { questions, Question } from "@/data/questions";

export interface TeamMember {
  id: string;
  name: string;
  eliminated: boolean;
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
}

interface GameContextType {
  state: GameState;
  setTeam: (name: string, members: string[]) => void;
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
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(initialState);

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
    const roundQuestions = questions.filter((q) => q.round === round);
    const shuffled = [...roundQuestions].sort(() => Math.random() - 0.5).slice(0, 4);
    setState((prev) => ({
      ...prev,
      currentQuestions: shuffled,
      currentQuestionIndex: 0,
      score: 0,
      selectedSuit: null,
    }));
  }, [state.currentRound]);

  const answerQuestion = useCallback((answer: string): boolean => {
    const q = state.currentQuestions[state.currentQuestionIndex];
    const correct = q.answer === answer;
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
      const gameOver = nextRound > 3;
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
