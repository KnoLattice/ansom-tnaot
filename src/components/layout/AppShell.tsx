"use client";

import type { PropsWithChildren } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Map,
  PlayCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { useDocuments, useHydrated } from "@/lib/hooks";
import { useSessionNavGuard } from "@/components/shared/SessionNavGuard";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/library", label: "Library", icon: BookOpen },
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const learner = useAuthStore((s) => s.learner);
  const logout = useAuthStore((s) => s.logout);
  const { activeDocumentId } = useDocuments();
  const { guardNavigation, dialog: sessionGuardDialog } = useSessionNavGuard();

  const initials = learner?.fullName
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isMasteryRoute = pathname?.startsWith("/mastery");
  const isSessionRoute = pathname?.startsWith("/session");

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      {/* ─── Top bar — floating glass strip ─── */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
        <nav className="flex h-14 w-full max-w-5xl items-center justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 px-4 shadow-sm backdrop-blur-xl">
          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              if (guardNavigation("/")) router.push("/");
            }}
            className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.2em] text-[var(--color-accent-primary)] transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent-primary)] text-[11px] font-bold text-white">
              KL
            </div>
            <span className="hidden sm:inline">KNOWLATTICE</span>
          </button>

          {/* Center nav */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => {
                  if (guardNavigation(href)) router.push(href);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}

            {hydrated && activeDocumentId && (
              <button
                type="button"
                onClick={() => {
                  const target = `/mastery/${activeDocumentId}`;
                  if (guardNavigation(target)) router.push(target);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                  isMasteryRoute
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            )}

            {hydrated && activeDocumentId && (
              <button
                type="button"
                onClick={() => {
                  const target = `/session/new?documentId=${activeDocumentId}`;
                  if (guardNavigation(target)) router.push(target);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                  isSessionRoute
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <PlayCircle className="h-4 w-4" />
                Session
              </button>
            )}
          </div>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-all duration-200 hover:bg-[var(--color-surface-elevated)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-[11px] font-bold text-white shadow-sm">
                  {hydrated ? initials || "KL" : "KL"}
                </div>
                {hydrated && (
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                      {learner?.fullName ?? "Learner"}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-lg text-[var(--color-text-primary)]">
              <DropdownMenuItem
                className="rounded-lg text-sm"
                onClick={() => router.push("/library")}
              >
                My documents
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg text-sm text-red-500"
                onClick={() => {
                  logout();
                  router.replace("/auth");
                }}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      {/* ─── Main content ─── */}
      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-24">
        {children}
      </main>

      {/* Session navigation guard dialog */}
      {sessionGuardDialog}
    </div>
  );
}
