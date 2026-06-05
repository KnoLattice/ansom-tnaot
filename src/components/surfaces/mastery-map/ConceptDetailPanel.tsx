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
      .filter(
        (e) =>
          e.targetNodeId === node.id && e.relationshipType === "prerequisite",
      )
      .map((e) => allNodes.find((n) => n.id === e.sourceNodeId))
      .filter(Boolean) as GraphNode[]
    : [];

  const unlocks = node
    ? edges
      .filter(
        (e) =>
          e.sourceNodeId === node.id && e.relationshipType === "prerequisite",
      )
      .map((e) => allNodes.find((n) => n.id === e.targetNodeId))
      .filter(Boolean) as GraphNode[]
    : [];

  const handleStudy = () => {
    router.push(`/session?documentId=${documentId}`);
  };

  const handleStudyPrerequisite = () => {
    if (prerequisites[0]) onSelectNode(prerequisites[0].id);
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
          className="flex w-full flex-col overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-default)] p-4">
            <div className="min-w-0 flex-1">
              <p className="kl-data-label">Concept Detail</p>
              <h3 className="mt-1 text-sm font-semibold leading-snug text-[var(--color-text-primary)]">
                {node.title}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <MasteryBadge
                  band={node.masteryBand ?? getMasteryBand(node.masteryScore)}
                />
                <span className="font-poppins text-[10px] font-bold tabular-nums text-[var(--color-text-secondary)]">
                  {formatMastery(node.masteryScore)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail panel"
              className="border border-[var(--color-border-default)] p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <ScrollArea className="flex-1" style={{ maxHeight: "calc(100vh - 18rem)" }}>
            <div className="space-y-4 p-4">
              <MasteryBar score={node.masteryScore} size="md" showLabel />

              {/* Description */}
              <div>
                <p className="kl-data-label">Description</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {node.description || "No description available for this concept."}
                </p>
              </div>

              {/* History placeholder */}
              <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] p-3">
                <p className="kl-data-label">Mastery Over Time</p>
                <p className="mt-2 font-poppins text-[10px] text-[var(--color-text-muted)]">
                  PER-CONCEPT HISTORY COMING SOON
                </p>
              </div>

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <div>
                  <p className="kl-data-label">Prerequisites</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {prerequisites.map((prereq) => (
                      <button
                        key={prereq.id}
                        type="button"
                        onClick={() => onSelectNode(prereq.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-default)] px-2 py-1 font-poppins text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
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
                  <p className="kl-data-label">Unlocks</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {unlocks.map((unlock) => (
                      <button
                        key={unlock.id}
                        type="button"
                        onClick={() => onSelectNode(unlock.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-poppins text-[10px] font-bold uppercase tracking-wider transition",
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

              {/* <p className="font-poppins text-[10px] text-[var(--color-text-muted)]">
                DEPTH: L{node.graphDepth}
              </p> */}
            </div>
          </ScrollArea>

          {/* Action footer */}
          <div className="shrink-0 border-t border-[var(--color-border-default)] p-4">
            {node.isLocked ? (
              <div className="space-y-3">
                <p className="font-poppins text-[10px] text-[var(--color-text-muted)]">
                  <Lock className="mr-1 inline h-3 w-3" />
                  COMPLETE PREREQUISITES TO UNLOCK
                </p>
                {prerequisites[0] && (
                  <Button
                    variant="outline"
                    className="w-full text-[10px]"
                    onClick={handleStudyPrerequisite}
                  >
                    STUDY &ldquo;{prerequisites[0].title}&rdquo;
                  </Button>
                )}
              </div>
            ) : (
              <Button className="w-full rounded-lg border" onClick={handleStudy}>
                <PlayCircle className="mr-2 h-4 w-4" />
                STUDY CONCEPT
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
