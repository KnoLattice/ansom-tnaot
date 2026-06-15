import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface Learner {
  id: string;
  fullName: string;
  email: string;
}

export const tokenAtom = atomWithStorage<string | null>("kl_token", null);
export const learnerAtom = atom<Learner | null>(null);
export const isAuthenticatedAtom = atom((get) => get(tokenAtom) !== null);
