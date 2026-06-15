"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionStore } from "@/store/session.store";

/**
 * Shows a confirmation dialog when the user tries to navigate away
 * from an active question session. Wraps nav links to intercept clicks,
 * and also prevents accidental tab close / refresh via beforeunload.
 */
export function useSessionNavGuard() {
  const sessionActive = useSessionStore((s) => s.sessionActive);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();

  // ── Browser close / refresh guard ──
  useEffect(() => {
    if (!sessionActive) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionActive]);

  /** Called by AppShell nav buttons BEFORE navigating. Returns true if navigation should proceed. */
  const guardNavigation = useCallback(
    (href: string): boolean => {
      if (!sessionActive) return true;
      setPendingHref(href);
      return false;
    },
    [sessionActive],
  );

  const handleConfirmLeave = useCallback(() => {
    if (pendingHref) {
      const endSession = useSessionStore.getState().endSession;
      endSession();
      router.push(pendingHref);
    }
    setPendingHref(null);
  }, [pendingHref, router]);

  const handleCancel = useCallback(() => {
    setPendingHref(null);
  }, []);

  return {
    guardNavigation,
    dialog: (
      <AlertDialog open={!!pendingHref} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent className="rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>LEAVE SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              You have an active study session in progress. Leaving now will end
              your current session and your progress so far will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md" onClick={handleCancel}>
              KEEP STUDYING
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-md" onClick={handleConfirmLeave}>
              LEAVE SESSION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  };
}
