"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Map,
  PlayCircle,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useDocuments, useHydrated } from "@/lib/hooks";
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
  const { activeDocument, activeDocumentId } = useDocuments();

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
      {/* ─── Top bar ─────────────────────────────────── */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <nav className="pointer-events-auto flex w-full max-w-6xl items-center rounded-2xl border border-border-default bg-[var(--panel-bg)] px-5 py-3 shadow-panel backdrop-blur-2xl justify-between">
          <div className="flex items-center gap-2 text-sm text-white/80">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Button
                key={href}
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "h-10 w-10 rounded-full border border-white/10 bg-white/5",
                  pathname === href && "bg-white text-black",
                )}
                onClick={() => router.push(href)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}

            {/* Mastery Map shortcut (only if active doc exists) */}
            {hydrated && activeDocumentId && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mastery Map"
                className={cn(
                  "h-10 w-10 rounded-full border border-white/10 bg-white/5",
                  isMasteryRoute && "bg-white text-black",
                )}
                onClick={() =>
                  router.push(`/mastery/${activeDocumentId}`)
                }
              >
                <Map className="h-4 w-4" />
              </Button>
            )}

            {/* Session shortcut */}
            {hydrated && activeDocumentId && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Start session"
                className={cn(
                  "h-10 w-10 rounded-full border border-white/10 bg-white/5",
                  isSessionRoute && "bg-white text-black",
                )}
                onClick={() =>
                  router.push(`/session/new?documentId=${activeDocumentId}`)
                }
              >
                <PlayCircle className="h-5 w-5" />
              </Button>
            )}

            {/* User dropdown */}
          </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-left"
                >
                  <Avatar className="h-9 w-9 border border-white/10 text-black">
                    <AvatarFallback className="bg-white font-semibold">
                      {hydrated ? (initials || "KL") : "KL"}
                    </AvatarFallback>
                  </Avatar>
                  {hydrated && (
                    <div className="hidden text-left text-xs text-text-secondary sm:block">
                      <p className="font-medium text-text-primary">
                        {learner?.fullName ?? "Learner"}
                      </p>
                      <p className="text-text-muted">
                        {learner?.email ?? ""}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border border-white/10 bg-surface text-white">
                <DropdownMenuItem onClick={() => router.push("/library")}>
                  My documents
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-300"
                  onClick={() => {
                    logout();
                    router.replace("/auth");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </nav>
      </header>

      {/* ─── Main content ────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-12 pt-28">
        {children}
      </main>
    </div>
  );
}
