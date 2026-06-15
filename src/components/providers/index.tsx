"use client";

import type { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={150}>
          <AuthInitializer>{children}</AuthInitializer>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
