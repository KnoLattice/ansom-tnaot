import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { AUTH_API } from "../constants/api";
import { HttpService } from "../services/http.service.";
import { authAtom, InitialAuthState } from "../stores/auth.atom";
import { ILearner } from "../types/learner.type";

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  learner: ILearner;
}

interface RegisterParams {
  fullname: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  accessToken: string;
  learner: ILearner;
}

export const useAuth = () => {
  const http = useMemo(() => new HttpService(), []);
  const [authState, setAuthState] = useAtom(authAtom);

  const register = useCallback(
    async (data: RegisterParams) => {
      if (authState.isAuthenticated) return;
      try {
        const response = await http.post<RegisterResponse, RegisterParams>(
          AUTH_API.REGISTER,
          data,
        );
        if (response) {
          setAuthState({
            isAuthenticated: true,
            user: response?.learner,
          });
        }
      } catch (error) {
        console.error(error);
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      }
    },
    [authState.isAuthenticated, http, setAuthState],
  );

  const login = useCallback(
    async (data: LoginParams) => {
      if (authState.isAuthenticated) return;
      try {
        const response = await http.post<LoginResponse, LoginParams>(
          AUTH_API.LOGIN,
          data,
        );
        if (response) {
          setAuthState({
            isAuthenticated: true,
            user: response?.learner,
          });
        }
      } catch (error) {
        console.error(error);
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      }
    },
    [authState.isAuthenticated, http, setAuthState],
  );

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  }, [setAuthState]);

  const setUserAuthState = useCallback(
    (data: InitialAuthState) => setAuthState(data),
    [setAuthState],
  );

  return {
    register,
    login,
    logout,

    authState,
    setUserAuthState,
  };
};
