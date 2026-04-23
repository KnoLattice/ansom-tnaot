"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphResponse } from "@/lib/types/api";
import { layoutGraph } from "@/lib/utils/graphLayout";
import { MasteryMapNode } from "./MasteryMapNode";

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
      selected: node.id === selectedNodeId,
    }));
  }, [data, selectedNodeId]);

  const edges: Edge[] = useMemo(() => {
    return data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: "default",
      style: {
        stroke:
          edge.relationshipType === "prerequisite"
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.06)",
        strokeWidth: 1,
        strokeDasharray:
          edge.relationshipType === "prerequisite" ? undefined : "4 4",
      },
    }));
  }, [data]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      panOnDrag
      zoomOnScroll
      onNodeClick={(_, node) => onSelectNode(node.id)}
    >
      <Background
        variant={BackgroundVariant.Dots}
        color="rgba(255,255,255,0.04)"
        gap={20}
        size={1}
      />
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
