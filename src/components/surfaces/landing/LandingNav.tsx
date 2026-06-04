"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, BookOpen, Map, PlayCircle, type LucideIcon } from "lucide-react";

// ── Config ──────────────────────────────────────────────────────────────────
const LOGO_SRC   = "/logo.png";
const LOGO_ALT   = "Learning logo";
const LOGO_LABEL = "Learning";
const LOGO_HREF  = "/landing";
const AUTH_HREF  = "/auth";

const AUTH_TABS = [
  { id: "login",    label: "Log in"   },
  { id: "register", label: "Register" },
] as const;

type AuthTab = typeof AUTH_TABS[number]["id"];

const NAV_LINKS: { label: string; href: string; active: boolean; Icon: LucideIcon }[] = [
  { label: "Home",    href: "#",         active: true,  Icon: LayoutGrid },
  { label: "Library", href: "#features", active: false, Icon: BookOpen   },
  { label: "Map",     href: "#",         active: false, Icon: Map        },
  { label: "Session", href: "#",         active: false, Icon: PlayCircle },
];

// ── Component ───────────────────────────────────────────────────────────────
export function LandingNav() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  function handleTabClick(tabId: AuthTab) {
    setActiveTab(tabId);
    router.push(AUTH_HREF);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/[0.97] backdrop-blur-[12px] border-b border-black/[0.06] font-poppins">
      <div className="max-w-[1280px] mx-auto px-8 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link href={LOGO_HREF} className="no-underline flex items-center gap-2.5">
          <img src={LOGO_SRC} alt={LOGO_ALT} className="w-[60px] h-[60px] object-contain" />
          <span className="font-bold text-base text-[#0f172a]">{LOGO_LABEL}</span>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-1.5">
          {NAV_LINKS.map(({ label, href, active, Icon }) => (
            <a
              key={label}
              href={href}
              className={[
                "flex items-center gap-1.5 rounded-full text-[0.9rem] no-underline transition-all duration-200",
                active
                  ? "px-5 py-[5px] text-blue-600 font-semibold bg-blue-50 border border-blue-200"
                  : "px-3.5 py-[5px] text-slate-500 font-medium bg-transparent border border-transparent hover:text-slate-700",
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </a>
          ))}
        </nav>

        {/* Auth tab switch */}
        <div
          role="tablist"
          aria-label="Authentication options"
          className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 gap-0.5"
        >
          {AUTH_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`auth-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab.id)}
                className={[
                  "px-5 py-1.5 rounded-full text-[0.875rem] border-none whitespace-nowrap cursor-pointer select-none",
                  "transition-all duration-[220ms] ease-[cubic-bezier(.4,0,.2,1)]",
                  isActive
                    ? "font-semibold text-white bg-[#0083ef] shadow-[0_2px_8px_rgba(0,131,239,0.35)]"
                    : "font-medium text-slate-500 bg-transparent",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
