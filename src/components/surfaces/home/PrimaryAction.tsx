"use client";

import { motion } from "framer-motion";
import { PlayCircle, Crosshair } from "lucide-react";
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
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      className="flex gap-3"
    >
      <Button
        size="lg"
        className="flex-1 kl-glow-accent"
        onClick={onStartSession}
      >
        <PlayCircle className="mr-2 h-5 w-5" />
        Start Session
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="flex-1"
        onClick={onChooseStudy}
      >
        <Crosshair className="mr-2 h-5 w-5" />
        Choose
      </Button>
    </motion.div>
  );
}
