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
import { useDocuments } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/library", label: "Library", icon: BookOpen },
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
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
        <nav className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[rgba(10,10,18,0.78)] px-5 py-3 shadow-panel backdrop-blur-2xl">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-lg tracking-[0.4em] text-white"
          >
            KL
          </Link>

          {/* Center — page label or active document */}
          <div className="hidden flex-1 items-center justify-center px-6 sm:flex">
            {activeDocument && (isMasteryRoute || isSessionRoute) ? (
              <p className="max-w-[240px] truncate text-xs uppercase tracking-[0.3em] text-white/50">
                {activeDocument.originalName.replace(/\.[^.]+$/, "")}
              </p>
            ) : (
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                {NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "KnowLattice"}
              </p>
            )}
          </div>

          {/* Right — nav actions + avatar */}
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
            {activeDocumentId && (
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
            {activeDocumentId && (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-left"
                >
                  <Avatar className="h-9 w-9 border border-white/10 text-black">
                    <AvatarFallback className="bg-white font-semibold">
                      {initials || "KL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left text-xs text-white/70 sm:block">
                    <p className="font-medium text-white">
                      {learner?.fullName ?? "Learner"}
                    </p>
                    <p className="text-white/60">
                      {learner?.email ?? ""}
                    </p>
                  </div>
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
          </div>
        </nav>
      </header>

      {/* ─── Main content ────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-12 pt-28">
        {children}
      </main>
    </div>
  );
}
