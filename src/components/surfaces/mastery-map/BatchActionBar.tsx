"use client";

import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BatchActionBarProps {
  conceptCount: number;
  documentId: string;
  visible: boolean;
}

export function BatchActionBar({
  conceptCount,
  documentId,
  visible,
}: BatchActionBarProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {visible && conceptCount > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
        >
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/90 px-6 py-3 shadow-panel backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{conceptCount}</span>{" "}
              concept{conceptCount !== 1 ? "s" : ""} selected by filter
            </p>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() =>
                router.push(`/session?documentId=${documentId}`)
              }
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start a session on these
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
