import dagre from "dagre";
import type { GraphEdge, GraphNode } from "@/lib/types/api";

interface PositionedNode extends GraphNode {
  position: { x: number; y: number };
}

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 140, marginx: 60, marginy: 60 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 220, height: 120 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.sourceNodeId, edge.targetNodeId);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id) as { x: number; y: number } | undefined;
    return {
      ...node,
      position: {
        x: dagreNode?.x ?? 0,
        y: dagreNode?.y ?? 0,
      },
    };
  });
}
