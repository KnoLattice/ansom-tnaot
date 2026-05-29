"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LibraryStripProps {
  activeDocumentName: string | null;
}

export function LibraryStrip({ activeDocumentName }: LibraryStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="flex min-w-0 items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <BookOpen className="h-4 w-4 shrink-0" />
        <span className="kl-data-label shrink-0">Active Doc:</span>
        <span className="truncate text-sm text-[var(--color-text-secondary)]">
          {activeDocumentName ?? "None"}
        </span>
      </div>
      <Link
        href="/library"
        className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-primary)] transition-all duration-200 hover:bg-[var(--color-accent-primary)]/10"
      >
        Library <ArrowRight className="h-3 w-3" />
      </Link>
    </motion.div>
  );
}
