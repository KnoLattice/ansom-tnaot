"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface LibraryStripProps {
  activeDocumentName: string | null;
}

export function LibraryStrip({ activeDocumentName }: LibraryStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.3 }}
      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
    >
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <BookOpen className="h-3.5 w-3.5" />
        <span className="truncate">
          {activeDocumentName ?? "No document selected"}
        </span>
      </div>
      <Link
        href="/library"
        className="shrink-0 text-xs font-medium text-accent-primary underline underline-offset-4"
      >
        Library
      </Link>
    </motion.div>
  );
}
