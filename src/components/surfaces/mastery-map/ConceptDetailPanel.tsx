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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    router.push(`/session?documentId=${documentId}&nodeId=${node!.id}`);
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          ref={panelRef}
          role="complementary"
          aria-label={`Details for ${node.title}`}
          className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-md"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] p-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Concept detail</p>
              <h3 className="mt-1 font-display text-lg leading-snug text-[var(--color-text-primary)]">
                {node.title}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <MasteryBadge band={node.masteryBand ?? getMasteryBand(node.masteryScore)} />
                <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
                  {formatMastery(node.masteryScore)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail panel"
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              <MasteryBar score={node.masteryScore} size="md" showLabel />

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Description</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {node.description || "No description available for this concept."}
                </p>
              </div>

              {/* History placeholder */}
              <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] p-4">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Mastery over time</p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Per-concept history coming soon
                </p>
              </div>

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">Prerequisites</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {prerequisites.map((prereq) => (
                      <button
                        key={prereq.id}
                        type="button"
                        onClick={() => onSelectNode(prereq.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
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
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">Unlocks</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {unlocks.map((unlock) => (
                      <button
                        key={unlock.id}
                        type="button"
                        onClick={() => onSelectNode(unlock.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition",
                          unlock.isLocked
                            ? "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                            : "border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/5",
                        )}
                      >
                        {unlock.isLocked && <Lock className="h-3 w-3" />}
                        {unlock.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-[var(--color-text-muted)]">
                Depth: L{node.graphDepth}
              </p>
            </div>
          </ScrollArea>

          {/* Action footer */}
          <div className="border-t border-[var(--color-border-subtle)] p-4">
            {node.isLocked ? (
              <div className="space-y-3">
                <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Lock className="h-3 w-3" />
                  Complete prerequisites to unlock
                </p>
                {prerequisites[0] && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={handleStudyPrerequisite}
                  >
                    Study &ldquo;{prerequisites[0].title}&rdquo;
                  </Button>
                )}
              </div>
            ) : (
              <Button
                className="w-full rounded-xl bg-[var(--color-accent-primary)] text-white hover:opacity-90"
                onClick={handleStudy}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Study concept
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
