import { atom } from "jotai";
import type {
  FeedbackResult,
  Question,
  SessionStats,
  TargetNode,
} from "../types/api";

export const sessionIdAtom = atom<string | null>(null);
export const sessionDocumentIdAtom = atom<string | null>(null);
export const currentNodeAtom = atom<TargetNode | null>(null);
export const currentQuestionAtom = atom<Question | null>(null);
export const sessionStatsAtom = atom<SessionStats | null>(null);
export const lastFeedbackAtom = atom<FeedbackResult | null>(null);
export const isSubmittingAtom = atom<boolean>(false);
export const questionStartTimeAtom = atom<number | null>(null);

export const clearSessionAtom = atom(null, (_get, set) => {
  set(sessionIdAtom, null);
  set(sessionDocumentIdAtom, null);
  set(currentNodeAtom, null);
  set(currentQuestionAtom, null);
  set(sessionStatsAtom, null);
  set(lastFeedbackAtom, null);
  set(isSubmittingAtom, false);
  set(questionStartTimeAtom, null);
});
