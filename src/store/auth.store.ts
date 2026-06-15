import { create } from "zustand";
import type { Learner } from "@/lib/types/api";

const STORAGE_KEY = "kl_access_token";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export interface AuthState {
  token: string | null;
  learner: Learner | null;
  setToken: (token: string | null) => void;
  setLearner: (learner: Learner | null) => void;
  hydrateLearner: (learner: Learner) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  learner: null,
  setToken: (token) => {
    set({ token });
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem(STORAGE_KEY, token);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  },
  setLearner: (learner) => set({ learner }),
  hydrateLearner: (learner) => set({ learner }),
  logout: () => {
    set({ token: null, learner: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
}));

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
