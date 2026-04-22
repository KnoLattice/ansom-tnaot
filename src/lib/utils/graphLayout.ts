import dagre from "dagre";
import type { GraphEdge, GraphNode } from "@/lib/types/api";

interface PositionedNode extends GraphNode {
  position: { x: number; y: number };
}

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 160, height: 40 });
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
