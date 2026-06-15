"use client";

import { useMemo } from "react";
import type { GraphResponse } from "@/lib/types/api";
import { useGraphStore } from "@/store/graph.store";
import { ForceGraph } from "@/components/graph/ForceGraph";

interface SpaceCanvasProps {
  data?: GraphResponse | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  highlightNodeIds?: Set<string>;
}

export function SpaceCanvas({
  data,
  selectedNodeId,
  onSelectNode,
}: SpaceCanvasProps) {
  const viewMode = useGraphStore((state) => state.viewMode);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return viewMode === "constellation"
      ? data.nodes.filter((n) => n.graphDepth === 0)
      : data.nodes;
  }, [data, viewMode]);

  const filteredEdges = useMemo(() => {
    if (!data || viewMode === "constellation") return [];
    return data.edges;
  }, [data, viewMode]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-0">
      <ForceGraph
        nodes={filteredNodes}
        edges={filteredEdges}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
      />
    </div>
  );
}
