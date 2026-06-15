"use client";

import type { GraphResponse } from "@/lib/types/api";
import { ForceGraph } from "@/components/graph/ForceGraph";

interface GraphViewProps {
  data: GraphResponse;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function GraphView({
  data,
  selectedNodeId,
  onSelectNode,
}: GraphViewProps) {
  return (
    <div className="h-full w-full">
      <ForceGraph
        nodes={data.nodes}
        edges={data.edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={(id) => {
          if (id) onSelectNode(id);
        }}
      />
    </div>
  );
}
