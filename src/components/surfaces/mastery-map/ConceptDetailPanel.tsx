"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Lock, PlayCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GraphNode, GraphEdge } from "@/lib/types/api";
import { MasteryBar } from "@/components/shared/MasteryBar";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatMastery, getMasteryBand } from "@/lib/utils/mastery";

interface ConceptDetailPanelProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
  documentId: string;
}

export function ConceptDetailPanel({
  node,
  allNodes,
  edges,
  onSelectNode,
  onClose,
  documentId,
}: ConceptDetailPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Compute prerequisites and unlocks
  const prerequisites = node
    ? edges
        .filter((e) => e.targetNodeId === node.id && e.relationshipType === "prerequisite")
        .map((e) => allNodes.find((n) => n.id === e.sourceNodeId))
        .filter(Boolean) as GraphNode[]
    : [];

  const unlocks = node
    ? edges
        .filter((e) => e.sourceNodeId === node.id && e.relationshipType === "prerequisite")
        .map((e) => allNodes.find((n) => n.id === e.targetNodeId))
        .filter(Boolean) as GraphNode[]
    : [];

  const handleStudy = () => {
    router.push(`/session?documentId=${documentId}`);
  };

  const handleStudyPrerequisite = () => {
    if (prerequisites[0]) {
      onSelectNode(prerequisites[0].id);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {node && (
        <motion.div
          key={node.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          ref={panelRef}
          role="complementary"
          aria-label={`Details for ${node.title}`}
          className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/8 p-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                Concept detail
              </p>
              <h3 className="mt-1 text-lg font-semibold leading-snug text-white">
                {node.title}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <MasteryBadge band={node.masteryBand ?? getMasteryBand(node.masteryScore)} />
                <span className="text-xs tabular-nums text-text-secondary">
                  {formatMastery(node.masteryScore)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail panel"
              className="rounded-lg p-1.5 text-text-muted transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              {/* Mastery bar */}
              <MasteryBar score={node.masteryScore} size="md" showLabel />

              {/* Description */}
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted">
                  Description
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {node.description || "No description available for this concept."}
                </p>
              </div>

              {/* Sparkline placeholder */}
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-widest text-text-muted">
                  Mastery over time
                </p>
                {/* TODO: Backend needs GET /concepts/:id/history for sparkline data */}
                <p className="mt-2 text-xs text-text-muted">
                  Per-concept history coming soon
                </p>
              </div>

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted">
                    Prerequisites
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prerequisites.map((prereq) => (
                      <button
                        key={prereq.id}
                        type="button"
                        onClick={() => onSelectNode(prereq.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary transition hover:bg-white/10 hover:text-white"
                      >
                        {prereq.title}
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocks */}
              {unlocks.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted">
                    Unlocks
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {unlocks.map((unlock) => (
                      <button
                        key={unlock.id}
                        type="button"
                        onClick={() => onSelectNode(unlock.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                          unlock.isLocked
                            ? "border-white/5 text-text-muted"
                            : "border-accent-primary/20 bg-accent-primary/5 text-accent-primary hover:bg-accent-primary/10",
                        )}
                      >
                        {unlock.isLocked && <Lock className="h-3 w-3" />}
                        {unlock.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Graph depth */}
              <p className="text-xs text-text-muted">
                Graph depth: level {node.graphDepth}
              </p>
            </div>
          </ScrollArea>

          {/* Action footer */}
          <div className="border-t border-white/8 p-5">
            {node.isLocked ? (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  <Lock className="mr-1 inline h-3 w-3" />
                  Complete the prerequisites above to unlock this concept.
                </p>
                {prerequisites[0] && (
                  <Button
                    variant="secondary"
                    className="w-full border border-white/10 bg-white/10 text-white"
                    onClick={handleStudyPrerequisite}
                  >
                    Study &ldquo;{prerequisites[0].title}&rdquo;
                  </Button>
                )}
              </div>
            ) : (
              <Button className="w-full" onClick={handleStudy}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Study this concept
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
