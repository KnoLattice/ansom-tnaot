"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on the server and on the first client render (to match SSR output),
 * then true after hydration is complete. Use this to gate any UI that depends on
 * client-only state (localStorage, Zustand persist, etc.) to avoid hydration mismatches.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
