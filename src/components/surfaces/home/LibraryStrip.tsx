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
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center justify-between rounded-xl bg-[var(--color-surface-elevated)] px-4 py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <BookOpen className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-text-muted)]">Active document</p>
          <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
            {activeDocumentName ?? "None selected"}
          </p>
        </div>
      </div>
      <Link
        href="/library"
        className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-primary)] transition-colors hover:bg-[var(--color-accent-primary)]/10"
      >
        Library <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}
