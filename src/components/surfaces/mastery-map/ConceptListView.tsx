"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { GraphNode } from "@/lib/types/api";
import { MasteryBar } from "@/components/shared/MasteryBar";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { cn } from "@/lib/utils";
import { formatMastery, getMasteryBand } from "@/lib/utils/mastery";

export type FilterKey = "all" | "below-mastered" | "mastered" | "locked";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "below-mastered", label: "Below mastered" },
  { key: "mastered", label: "Mastered" },
  { key: "locked", label: "Locked" },
];

type SortKey = "mastery" | "name" | "depth";

interface ConceptListViewProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  filter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

export function ConceptListView({
  nodes,
  selectedNodeId,
  onSelectNode,
  filter,
  onFilterChange,
}: ConceptListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("mastery");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredNodes = useMemo(() => {
    let filtered = [...nodes];
    switch (filter) {
      case "below-mastered":
        filtered = filtered.filter((n) => !n.isLocked && n.masteryScore < 0.7);
        break;
      case "mastered":
        filtered = filtered.filter((n) => n.masteryScore >= 0.7);
        break;
      case "locked":
        filtered = filtered.filter((n) => n.isLocked);
        break;
    }
    return filtered;
  }, [nodes, filter]);

  const sortedNodes = useMemo(() => {
    const sorted = [...filteredNodes];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "mastery":
          cmp = a.masteryScore - b.masteryScore;
          break;
        case "name":
          cmp = a.title.localeCompare(b.title);
          break;
        case "depth":
          cmp = a.graphDepth - b.graphDepth;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [filteredNodes, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              filter === f.key
                ? "border-accent-primary bg-accent-primary/10 text-white"
                : "border-white/10 bg-white/5 text-text-muted hover:text-white",
            )}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 tabular-nums text-text-muted">
                {f.key === "below-mastered"
                  ? nodes.filter((n) => !n.isLocked && n.masteryScore < 0.7).length
                  : f.key === "mastered"
                    ? nodes.filter((n) => n.masteryScore >= 0.7).length
                    : nodes.filter((n) => n.isLocked).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_120px_100px_80px] items-center gap-3 px-4 text-xs uppercase tracking-wider text-text-muted">
        <SortButton label="Concept" sortKey="name" current={sortKey} asc={sortAsc} onClick={handleSort} />
        <SortButton label="Mastery" sortKey="mastery" current={sortKey} asc={sortAsc} onClick={handleSort} />
        <span>Band</span>
        <SortButton label="Depth" sortKey="depth" current={sortKey} asc={sortAsc} onClick={handleSort} />
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {sortedNodes.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No concepts match this filter.
          </p>
        ) : (
          sortedNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelectNode(node.id)}
              className={cn(
                "grid w-full grid-cols-[1fr_120px_100px_80px] items-center gap-3 rounded-xl px-4 py-3 text-left transition",
                node.id === selectedNodeId
                  ? "border border-accent-primary/30 bg-accent-primary/5"
                  : "border border-transparent hover:bg-white/5",
                node.isLocked && "opacity-60",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {node.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MasteryBar score={node.masteryScore} size="xs" animated={false} className="flex-1" />
                <span className="shrink-0 text-xs tabular-nums text-text-secondary">
                  {formatMastery(node.masteryScore)}
                </span>
              </div>
              <MasteryBadge band={node.masteryBand ?? getMasteryBand(node.masteryScore)} />
              <span className="text-xs tabular-nums text-text-muted">
                {node.isLocked ? "Locked" : `L${node.graphDepth}`}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SortButton({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}) {
  const isActive = current === sortKey;
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-left",
        isActive && "text-white",
      )}
    >
      {label}
      {isActive && (
        <ArrowUpDown className={cn("h-3 w-3", asc && "rotate-180")} />
      )}
    </button>
  );
}
