import { create } from "zustand";
import type {
  FeedbackResult,
  Question,
  SessionStats,
  TargetNode,
} from "@/lib/types/api";

interface SessionStore {
  sessionId: string | null;
  documentId: string | null;
  currentNode: TargetNode | null;
  currentQuestion: Question | null;
  sessionStats: SessionStats | null;
  lastFeedback: FeedbackResult | null;
  isSubmitting: boolean;
  sessionActive: boolean;
  questionStartedAt: number | null;
  startSession: (sessionId: string, documentId: string) => void;
  updateNode: (node: TargetNode | null) => void;
  updateQuestion: (question: Question | null) => void;
  updateStats: (stats: SessionStats | null) => void;
  setFeedback: (feedback: FeedbackResult | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  markQuestionStart: () => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  documentId: null,
  currentNode: null,
  currentQuestion: null,
  sessionStats: null,
  lastFeedback: null,
  isSubmitting: false,
  sessionActive: false,
  questionStartedAt: null,
  startSession: (sessionId, documentId) =>
    set({ sessionId, documentId, sessionActive: true }),
  updateNode: (currentNode) => set({ currentNode }),
  updateQuestion: (currentQuestion) => set({ currentQuestion }),
  updateStats: (sessionStats) => set({ sessionStats }),
  setFeedback: (lastFeedback) => set({ lastFeedback }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  markQuestionStart: () => set({ questionStartedAt: Date.now() }),
  endSession: () =>
    set({
      sessionId: null,
      documentId: null,
      currentNode: null,
      currentQuestion: null,
      sessionStats: null,
      lastFeedback: null,
      isSubmitting: false,
      sessionActive: false,
      questionStartedAt: null,
    }),
}));
