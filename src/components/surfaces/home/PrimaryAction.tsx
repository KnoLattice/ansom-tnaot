"use client";

import { motion } from "framer-motion";
import { PlayCircle, CircleCheck } from "lucide-react";
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
      transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      className="flex gap-3"
    >
      <Button
        className="flex-1 py-6 text-sm rounded-xl bg-[var(--color-accent-primary)] shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
        onClick={onStartSession}
      >
        <PlayCircle className="mr-2 h-5 w-5" />
        Start Session
      </Button>
      <Button
        variant="outline"
        className="py-6 text-sm rounded-xl border-[var(--color-accent-primary)]/30 
        bg-[var(--color-accent-primary)]/5 text-[var(--color-accent-primary)] 
        hover:bg-[var(--color-accent-primary)]/10 
        hover:border-[var(--color-accent-primary)]/50 hover:shadow-sm transition-all duration-200"
        onClick={onChooseStudy}
      >
        <CircleCheck className="mr-2 h-4 w-4" />
        Choose
      </Button>
    </motion.div>
  );
}
