"use client";

import { useAuth } from "@/lib/hooks";
import Image from "next/image";
import { useCallback, useMemo } from "react";

export default function Home() {
  const { login, logout, authState } = useAuth();

  const onLogin = useCallback(() => {
    login({ email: "sovichea@gmail.com", password: "StrongPass123!" });
  }, [login]);

  const onLogout = useCallback(() => {
    logout();
  }, [logout]);

  return useMemo(
    () => (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Welcome to KnoLattice {authState?.user?.fullName}
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Improve your knowledge with KnoLattice
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <button
              className="px-8 py-2 bg-black rounded-lg text-white"
              onClick={onLogin}
            >
              Login
            </button>
            <button
              className="px-8 py-2 bg-red-500 rounded-lg text-white"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    ),
    [authState, onLogin, onLogout],
  );
}
