"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LineChart, Library, LogOut, PlayCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "@/components/graph/ViewModeToggle";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const learner = useAuthStore((state) => state.learner);
  const logout = useAuthStore((state) => state.logout);

  const initials = learner?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showViewToggle = pathname === "/space";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[rgba(10,10,18,0.78)] px-5 py-3 shadow-panel backdrop-blur-2xl">
        <Link href="/space" className="font-display text-lg tracking-[0.4em] text-white">
          KL
        </Link>
        <div className="flex flex-1 items-center justify-center px-6">
          {showViewToggle ? (
            <ViewModeToggle />
          ) : (
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              {pathname === "/library"
                ? "Library"
                : pathname === "/progress"
                  ? "Progress"
                  : pathname?.startsWith("/session")
                    ? "Session"
                    : "Universe"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full border border-white/10 bg-white/5",
              pathname === "/library" && "bg-white text-black",
            )}
            onClick={() => router.push("/library")}
          >
            <Library className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-white/10 bg-white/5"
            onClick={() => toast.info("Progress overlay coming soon")}
          >
            <LineChart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full border border-white/10 bg-white/5",
              pathname?.startsWith("/session") && "bg-white text-black",
            )}
            onClick={() => router.push("/session")}
          >
            <PlayCircle className="h-5 w-5" />
          </Button>
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
                  <p className="font-medium text-white">{learner?.fullName ?? "Learner"}</p>
                  <p className="text-white/60">{learner?.email ?? "you@example.com"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 border border-white/10 bg-surface text-white">
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/library")}>My documents</DropdownMenuItem>
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
      </div>
    </header>
  );
}
