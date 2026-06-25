"use client";

import type { PropsWithChildren, MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  LogOut,
  Map,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { useDocuments, useHydrated } from "@/lib/hooks";
import { useSessionNavGuard } from "@/components/shared/SessionNavGuard";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
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

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      {/* ─── Top navigation bar ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas)]/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          {/* Brand */}
          <Link
            href="/"
            prefetch
            onClick={(e: MouseEvent) => {
              if (!guardNavigation("/")) e.preventDefault();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-primary)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl text-[var(--color-text-primary)]">
              Adaptify
            </span>
          </Link>

          {/* Center nav */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                prefetch
                onClick={(e: MouseEvent) => {
                  if (!guardNavigation(href)) e.preventDefault();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {hydrated && activeDocumentId && (
              <Link
                href={`/mastery/${activeDocumentId}`}
                prefetch
                onClick={(e: MouseEvent) => {
                  const target = `/mastery/${activeDocumentId}`;
                  if (!guardNavigation(target)) e.preventDefault();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isMasteryRoute
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <Map className="h-4 w-4" />
                Map
              </Link>
            )}
          </div>

          {/* Right: Theme + User */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10 text-sm font-semibold text-[var(--color-accent-primary)]">
                    {hydrated ? initials || "A" : "A"}
                  </div>
                  {hydrated && (
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {learner?.fullName ?? "Learner"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-md"
              >
                <DropdownMenuItem
                  className="rounded-lg text-sm"
                  onClick={() => router.push("/library")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  My documents
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg text-sm text-red-500"
                  onClick={() => {
                    logout();
                    router.replace("/auth");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* ─── Main content ─── */}
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-20">
        {children}
      </main>

      {/* Session navigation guard dialog */}
      {sessionGuardDialog}
    </div>
  );
}
