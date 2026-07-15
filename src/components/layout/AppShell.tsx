"use client";

import type { PropsWithChildren, MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Map,
  MessageSquare,
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
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "HOME", icon: LayoutGrid },
  { href: "/library", label: "LIB", icon: BookOpen },
  { href: "/chat", label: "CHAT", icon: MessageSquare },
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
      {/* ─── Top bar — brutalist strip ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-canvas)]">
        <nav className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          {/* Brand */}
          <Link
            href="/"
            prefetch
            onClick={(e: MouseEvent) => {
              if (!guardNavigation("/")) e.preventDefault();
            }}
            className="font-mono text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent-primary)]"
          >
            Adaptify
          </Link>

          {/* Center nav */}
          <div className="flex items-center gap-0">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                prefetch
                onClick={(e: MouseEvent) => {
                  if (!guardNavigation(href)) e.preventDefault();
                }}
                className={cn(
                  "flex h-12 items-center gap-2 border-b-2 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                  pathname === href
                    ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
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
                  "flex h-12 items-center gap-2 border-b-2 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                  isMasteryRoute
                    ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Map className="h-3.5 w-3.5" />
                MAP
              </Link>
            )}

            {/*{hydrated && activeDocumentId && (
              <button
                type="button"
                onClick={() => {
                  const target = `/session/new?documentId=${activeDocumentId}`;
                  if (guardNavigation(target)) router.push(target);
                }}
                className={cn(
                  "flex h-12 items-center gap-2 border-b-2 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                  isSessionRoute
                    ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <PlayCircle className="h-3.5 w-3.5" />
                SESSION
              </button>

              // <Button>SESSION</Button>
            )}*/}
          </div>

          {/* Theme + User */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 border-l border-[var(--color-border-default)] pl-4 text-left"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface)] font-mono text-[10px] font-bold text-[var(--color-text-primary)]">
                    {hydrated ? initials || "KL" : "KL"}
                  </div>
                  {hydrated && (
                    <div className="hidden sm:block">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                        {learner?.fullName ?? "Learner"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                <DropdownMenuItem
                  className="font-mono text-xs uppercase tracking-wider"
                  onClick={() => router.push("/library")}
                >
                  My documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-mono text-xs uppercase tracking-wider text-red-400"
                  onClick={() => {
                    logout();
                    router.replace("/auth");
                  }}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* ─── Main content ─── */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-16">
        {children}
      </main>

      {/* Session navigation guard dialog */}
      {sessionGuardDialog}
    </div>
  );
}
