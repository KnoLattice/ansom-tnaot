"use client";

import { motion } from "framer-motion";
import { Play, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrimaryActionProps {
  documentId: string;
  onStartSession: () => void;
  onChooseStudy: () => void;
}

export function PrimaryAction({
  onStartSession,
  onChooseStudy,
}: PrimaryActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
      className="flex gap-3"
    >
      <Button
        className="flex-1 h-14 rounded-xl bg-[var(--color-accent-primary)] text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity"
        onClick={onStartSession}
      >
        <Play className="mr-2 h-4 w-4" />
        Start a study session
      </Button>
      <Button
        variant="outline"
        className="h-14 rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
        onClick={onChooseStudy}
      >
        <Compass className="mr-2 h-4 w-4" />
        Choose topics
      </Button>
    </motion.div>
  );
}
