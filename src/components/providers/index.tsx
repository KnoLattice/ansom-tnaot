"use client";

import type { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={150}>
        <AuthInitializer>{children}</AuthInitializer>
      </TooltipProvider>
    </QueryProvider>
  );
}
