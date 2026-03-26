import { atomWithStorage } from "jotai/utils";
import { ILearner } from "../types/learner.type";

export type InitialAuthState = {
  user: ILearner | null;
  isAuthenticated: boolean;
};

export const authAtom = atomWithStorage<InitialAuthState>('_auth_state_', {
  user: null,
  isAuthenticated: false,
});
