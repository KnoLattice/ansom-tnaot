import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { LearningPreferences } from "@/lib/types/api";

export interface Learner {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  learningPreferences?: LearningPreferences | null;
}

export const tokenAtom = atomWithStorage<string | null>("kl_token", null);
export const learnerAtom = atom<Learner | null>(null);
export const isAuthenticatedAtom = atom((get) => get(tokenAtom) !== null);
