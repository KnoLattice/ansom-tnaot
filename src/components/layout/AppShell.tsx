"use client";

import { useEffect } from "react";
import type { PropsWithChildren, MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Map,
  PlayCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { useDocuments, useHydrated } from "@/lib/hooks";
import { useSessionNavGuard } from "@/components/shared/SessionNavGuard";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const PdfViewer = dynamic(
  () => import("@/components/surfaces/pdf/PdfViewer").then((m) => m.PdfViewer),
  { ssr: false },
);

const ChatDrawer = dynamic(
  () => import("@/components/surfaces/chat/ChatDrawer").then((m) => m.ChatDrawer),
  { ssr: false },
);

const NAV_ITEMS = [
  { href: "/", label: "HOME", icon: LayoutGrid },
  { href: "/library", label: "LIB", icon: BookOpen },
  { href: "/exploration", label: "EXPLORE", icon: Sparkles },
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const learner = useAuthStore((s) => s.learner);
  const logout = useAuthStore((s) => s.logout);
  const { activeDocumentId } = useDocuments();
  const { guardNavigation, dialog: sessionGuardDialog } = useSessionNavGuard();
  const toggleChatDrawer = useChatStore((s) => s.toggleChatDrawer);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleChatDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChatDrawer]);

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
      {/* ─── Top bar — clean modern strip ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas)]/80 backdrop-blur-xl kl-elevation-1">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <Link
            href="/"
            prefetch
            onClick={(e: MouseEvent) => {
              if (!guardNavigation("/")) e.preventDefault();
            }}
            className="font-display text-base font-bold text-[var(--color-accent-primary)]"
          >
            Adaptify
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
                  "flex h-9 items-center gap-2 rounded-[var(--radius-button)] px-3.5 text-sm font-medium transition-all duration-150",
                  pathname === href
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {hydrated && (
              <Link
                href={activeDocumentId ? `/mastery/${activeDocumentId}` : "/library"}
                prefetch
                onClick={(e: MouseEvent) => {
                  const target = activeDocumentId ? `/mastery/${activeDocumentId}` : "/library";
                  if (!guardNavigation(target)) e.preventDefault();
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-[var(--radius-button)] px-3.5 text-sm font-medium transition-all duration-150",
                  isMasteryRoute
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Map className="h-4 w-4" />
                MAP
              </Link>
            )}

            {hydrated && activeDocumentId && (
              <button
                type="button"
                onClick={() => {
                  const target = `/session/new?documentId=${activeDocumentId}`;
                  if (guardNavigation(target)) router.push(target);
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-[var(--radius-button)] px-3.5 text-sm font-medium transition-all duration-150",
                  isSessionRoute
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <PlayCircle className="h-4 w-4" />
                SESSION
              </button>
            )}
          </div>

          {/* Theme + User */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 border-l border-[var(--color-border-subtle)] pl-4 text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] font-display text-sm font-semibold text-[var(--color-text-primary)] kl-elevation-1">
                    {hydrated ? initials || "KL" : "KL"}
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
              <DropdownMenuContent className="w-48 border rounded-[var(--radius-dialog)] border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)] kl-elevation-2">
                <DropdownMenuItem
                  className="text-sm"
                  onClick={() => router.push("/library")}
                >
                  My documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-sm"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-sm text-red-500"
                  onClick={() => {
                    logout();
                    router.replace("/auth");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* ─── Main content ─── */}
      <main className="mx-auto w-full max-w-7xl px-6 pb-12 pt-20">
        {children}
      </main>

      {/* Session navigation guard dialog */}
      {sessionGuardDialog}

      {/* PDF viewer side panel */}
      <PdfViewer />

      {/* Chat side drawer */}
      <ChatDrawer />
    </div>
  );
}
