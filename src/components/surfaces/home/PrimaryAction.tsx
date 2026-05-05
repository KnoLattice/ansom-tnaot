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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex gap-3"
    >
      <Button className="flex-1 py-6 text-sm" onClick={onStartSession}>
        <PlayCircle className="mr-2 h-4 w-4" />
        START SESSION
      </Button>
      <Button
        variant="outline"
        className="py-6 text-sm"
        onClick={onChooseStudy}
      >
        <Crosshair className="mr-2 h-4 w-4" />
        CHOOSE
      </Button>
    </motion.div>
  );
}
