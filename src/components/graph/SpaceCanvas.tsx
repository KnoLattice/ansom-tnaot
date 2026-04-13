"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphResponse } from "@/lib/types/api";
import { useGraphStore } from "@/store/graph.store";
import { layoutGraph } from "@/lib/utils/graphLayout";
import { ConceptNode } from "@/components/graph/nodes/ConceptNode";
import { cn } from "@/lib/utils";

interface SpaceCanvasProps {
  data?: GraphResponse | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  highlightNodeIds?: Set<string>;
}

const nodeTypes: NodeTypes = { concept: ConceptNode };

function InnerSpaceCanvas({
  data,
  selectedNodeId,
  onSelectNode,
  highlightNodeIds,
}: SpaceCanvasProps) {
  const viewMode = useGraphStore((state) => state.viewMode);

  const nodes: Node[] = useMemo(() => {
    if (!data) return [];
    const positioned = layoutGraph(data.nodes, data.edges);
    const filtered =
      viewMode === "constellation"
        ? positioned.filter((node) => node.graphDepth === 0)
        : positioned;
    return filtered.map((node) => ({
      id: node.id,
      type: "concept",
      data: { node },
      position: node.position,
      draggable: true,
      selectable: !node.isLocked,
      className: cn(
        "transition-all duration-300",
        node.id === selectedNodeId && "ring-4 ring-white/70",
        highlightNodeIds && !highlightNodeIds.has(node.id) && "opacity-35",
      ),
    }));
  }, [data, highlightNodeIds, selectedNodeId, viewMode]);

  const edges: Edge[] = useMemo(() => {
    if (!data || viewMode === "constellation") return [];
    return data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: "smoothstep",
      animated: edge.relationshipType === "prerequisite",
      data: { edge },
      style: {
        stroke:
          edge.relationshipType === "prerequisite"
            ? "var(--color-border-default)"
            : "var(--color-border-subtle)",
        strokeDasharray: edge.relationshipType === "prerequisite" ? undefined : "6 4",
        strokeWidth: edge.relationshipType === "prerequisite" ? 1.6 : 1,
      },
    }));
  }, [data, viewMode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      minZoom={0.25}
      maxZoom={1.5}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      panOnDrag
      zoomOnScroll
      selectionOnDrag
      onNodeClick={(_, node) => onSelectNode(node.id)}
      className="space-flow"
    >
      <Background color="rgba(255,255,255,0.05)" gap={24} />
    </ReactFlow>
  );
}

export function SpaceCanvas(props: SpaceCanvasProps) {
  return (
    <div className="fixed inset-0 z-0">
      <ReactFlowProvider>
        <InnerSpaceCanvas {...props} />
      </ReactFlowProvider>
    </div>
  );
}
