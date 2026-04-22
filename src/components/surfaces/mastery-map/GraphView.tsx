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
import { layoutGraph } from "@/lib/utils/graphLayout";
import { MasteryMapNode } from "./MasteryMapNode";
import { cn } from "@/lib/utils";

interface GraphViewProps {
  data: GraphResponse;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = { concept: MasteryMapNode };

function InnerGraphView({
  data,
  selectedNodeId,
  onSelectNode,
}: GraphViewProps) {
  const nodes: Node[] = useMemo(() => {
    const positioned = layoutGraph(data.nodes, data.edges);
    return positioned.map((node) => ({
      id: node.id,
      type: "concept",
      data: { node },
      position: node.position,
      draggable: true,
      selectable: !node.isLocked,
      className: cn(
        "transition-all duration-300",
        node.id === selectedNodeId && "ring-4 ring-accent-primary/60 rounded-full",
      ),
    }));
  }, [data, selectedNodeId]);

  const edges: Edge[] = useMemo(() => {
    return data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: "smoothstep",
      animated: edge.relationshipType === "prerequisite",
      style: {
        stroke:
          edge.relationshipType === "prerequisite"
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0.08)",
        strokeDasharray:
          edge.relationshipType === "prerequisite" ? undefined : "6 4",
        strokeWidth: edge.relationshipType === "prerequisite" ? 1.5 : 1,
      },
    }));
  }, [data]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      minZoom={0.3}
      maxZoom={1.5}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      panOnDrag
      zoomOnScroll
      onNodeClick={(_, node) => onSelectNode(node.id)}
    >
      <Background color="rgba(255,255,255,0.04)" gap={24} />
    </ReactFlow>
  );
}

export function GraphView(props: GraphViewProps) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <InnerGraphView {...props} />
      </ReactFlowProvider>
    </div>
  );
}
