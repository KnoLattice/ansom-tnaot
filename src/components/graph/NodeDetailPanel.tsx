"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import type { GraphResponse } from "@/lib/types/api";
import { MasteryBar } from "@/components/ui/MasteryBar";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NodeDetailPanelProps {
  node: GraphResponse["nodes"][number] | null;
  prerequisites: GraphResponse["nodes"][number][];
  unlocks: GraphResponse["nodes"][number][];
  onSelectNode?: (nodeId: string) => void;
  onStudy?: () => void;
}

export function NodeDetailPanel({
  node,
  prerequisites,
  unlocks,
  onSelectNode,
  onStudy,
}: NodeDetailPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <Sparkles className="mb-3 h-6 w-6 text-primary" />
        <p>Tap any concept in the graph to inspect its mastery context.</p>
      </div>
    );
  }

  const parentNode = prerequisites[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Concept spotlight
          </p>
          <h3 className="text-xl font-semibold leading-snug text-foreground">
            {node.title}
          </h3>
        </div>
        <MasteryBadge band={node.masteryBand} />
      </div>

      <div className="rounded-2xl border p-4 shadow-sm">
        <MasteryBar score={node.masteryScore} showLabel size="md" />
        <p className="mt-2 text-xs text-muted-foreground">
          Graph depth level {node.graphDepth}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {node.description || "No description available yet for this concept."}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <ConceptStat
          label="Eligibility"
          value={node.isLocked ? "Locked" : "Ready"}
          tone={node.isLocked ? "danger" : "success"}
        />
        <ConceptStat
          label="Relationships"
          value={`${prerequisites.length} upstream`}
          hint={`${unlocks.length} unlocks`}
        />
      </div>

      {parentNode && (
        <div className="rounded-2xl border border-dashed p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Parent concept
          </p>
          <button
            type="button"
            onClick={() => onSelectNode?.(parentNode.id)}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
          >
            {parentNode.title}
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <p className="mt-1 text-xs text-muted-foreground">
            Start here to reinforce the foundation before diving deeper.
          </p>
        </div>
      )}

      {prerequisites.length > 0 && (
        <NodeTagList
          label="Prerequisites"
          nodes={prerequisites}
          onSelectNode={onSelectNode}
        />
      )}

      {unlocks.length > 0 && (
        <NodeTagList
          label="Unlocks next"
          nodes={unlocks}
          highlight
          onSelectNode={onSelectNode}
        />
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="w-full"
            disabled={node.isLocked}
            onClick={onStudy}
          >
            {node.isLocked ? "Locked concept" : "Start adaptive session"}
          </Button>
        </TooltipTrigger>
        {node.isLocked && (
          <TooltipContent>
            Complete the prerequisites above to unlock this concept.
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}

function ConceptStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClasses: Record<typeof tone, string> = {
    default: "text-foreground",
    success: "text-emerald-600",
    danger: "text-rose-600",
  };
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-semibold ${toneClasses[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function NodeTagList({
  label,
  nodes,
  highlight = false,
  onSelectNode,
}: {
  label: string;
  nodes: GraphResponse["nodes"];
  highlight?: boolean;
  onSelectNode?: (nodeId: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelectNode?.(node.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              highlight
                ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-muted-foreground/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {node.title}
          </button>
        ))}
      </div>
    </div>
  );
}
