"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="space-y-2"
    >
      <Button className="w-full py-6 text-base" onClick={onStartSession}>
        <PlayCircle className="mr-2 h-5 w-5" />
        Start a 10-minute session
      </Button>
      <p className="text-center">
        <button
          type="button"
          className="text-xs text-text-muted underline underline-offset-4 transition-colors hover:text-text-secondary"
          onClick={onChooseStudy}
        >
          Or choose what to study
        </button>
      </p>
    </motion.div>
  );
}
