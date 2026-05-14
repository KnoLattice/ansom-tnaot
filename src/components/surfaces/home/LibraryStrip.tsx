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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between border rounded-md border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2.5"
    >
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <BookOpen className="h-3.5 w-3.5" />
        <span className="kl-data-label">Active Doc:</span>
        <span className="truncate font-mono text-xs text-[var(--color-text-secondary)]">
          {activeDocumentName ?? "NONE"}
        </span>
      </div>
      <Link
        href="/library"
        className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        LIBRARY <ArrowRight className="h-3 w-3" />
      </Link>
    </motion.div>
  );
}
