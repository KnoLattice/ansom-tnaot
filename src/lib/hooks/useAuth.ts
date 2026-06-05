"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient, API_BASE_URL } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { AuthResponse, Learner } from "@/lib/types/api";
import { useAuthStore } from "@/store/auth.store";

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload extends Credentials {
  fullName: string;
}

export function useAuth() {
  const router = useRouter();
  const { token, learner, setToken, setLearner, logout: clearAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyAuthResponse = useCallback(
    (response: AuthResponse) => {
      setToken(response.accessToken);
      setLearner(response.learner);
    },
    [setLearner, setToken],
  );

  const fetchCurrentLearner = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await apiClient.get<Learner>(API_ROUTES.LEARNER.ME);
      setLearner(data);
      return data;
    } catch (error) {
      console.error(error);
      setToken(null);
      return null;
    }
  }, [setLearner, setToken, token]);

  const handleAuthRequest = useCallback(
    async (
      endpoint: string,
      payload: RegisterPayload | Credentials,
      successMessage: string,
      options?: { redirectTo?: string | false },
    ) => {
      setIsSubmitting(true);
      try {
        const { data } = await apiClient.post<AuthResponse>(endpoint, payload);
        applyAuthResponse(data);
        toast.success(successMessage);
        if (options?.redirectTo !== false) {
          router.replace(options?.redirectTo ?? "/");
        }
        return true;
      } catch (error: unknown) {
        const message =
          (typeof error === "object" &&
            error !== null &&
            "response" in error &&
            typeof (error as { response?: { data?: { message?: string } } })
              .response?.data?.message === "string" &&
            (
              error as { response?: { data?: { message?: string } } }
            ).response?.data?.message) ||
          "Unable to complete request";
        toast.error(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyAuthResponse, router],
  );

  const register = useCallback(
    (payload: RegisterPayload, options?: { redirectTo?: string | false }) =>
      handleAuthRequest(
        API_ROUTES.AUTH.REGISTER,
        payload,
        "Account created!",
        options,
      ),
    [handleAuthRequest],
  );

  const login = useCallback(
    (payload: Credentials) =>
      handleAuthRequest(API_ROUTES.AUTH.LOGIN, payload, "Welcome back!"),
    [handleAuthRequest],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post(API_ROUTES.AUTH.LOGOUT);
    } catch {
      // ignore best-effort logout
    }
    clearAuth();
    router.replace("/landing");
  }, [clearAuth, router]);

  const googleLogin = useCallback(() => {
    if (!API_BASE_URL) {
      toast.error("Missing API base URL");
      return;
    }
    window.location.href = `${API_BASE_URL}${API_ROUTES.AUTH.GOOGLE}`;
  }, []);

  const completeGoogleLogin = useCallback(
    async ({ accessToken }: { accessToken: string }) => {
      setToken(accessToken);
      await fetchCurrentLearner();
      router.replace("/");
    },
    [fetchCurrentLearner, router, setToken],
  );

  return {
    token,
    learner,
    isSubmitting,
    register,
    login,
    logout,
    googleLogin,
    completeGoogleLogin,
    fetchCurrentLearner,
  };
}
