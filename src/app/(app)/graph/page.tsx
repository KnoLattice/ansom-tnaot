"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { MasteryBar } from "@/components/ui/MasteryBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/Spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { GraphResponse } from "@/lib/types/api";
import { cn } from "@/lib/utils";

export default function GraphPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const router = useRouter();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const graphQuery = useQuery({
    queryKey: ["graph", documentId],
    queryFn: async () => {
      const { data } = await apiClient.get<GraphResponse>(API_ROUTES.GRAPH.TOPOLOGY, {
        params: { documentId },
      });
      return data;
    },
    enabled: Boolean(documentId),
  });

  const nodes = useMemo(() => graphQuery.data?.nodes ?? [], [graphQuery.data?.nodes]);
  const edges = useMemo(() => graphQuery.data?.edges ?? [], [graphQuery.data?.edges]);

  const resolvedNodeId = selectedNodeId ?? nodes[0]?.id ?? null;

  const selectedNode = useMemo(() => {
    if (!resolvedNodeId) return null;
    return nodes.find((node) => node.id === resolvedNodeId) ?? null;
  }, [nodes, resolvedNodeId]);

  const prerequisites = useMemo(() => {
    if (!selectedNode) return [];
    const prereqIds = edges
      .filter(
        (edge) =>
          edge.relationshipType === "prerequisite" &&
          edge.targetNodeId === selectedNode.id,
      )
      .map((edge) => edge.sourceNodeId);
    return nodes.filter((node) => prereqIds.includes(node.id));
  }, [edges, nodes, selectedNode]);

  const unlocks = useMemo(() => {
    if (!selectedNode) return [];
    const unlockIds = edges
      .filter(
        (edge) =>
          edge.relationshipType === "prerequisite" &&
          edge.sourceNodeId === selectedNode.id,
      )
      .map((edge) => edge.targetNodeId);
    return nodes.filter((node) => unlockIds.includes(node.id));
  }, [edges, nodes, selectedNode]);

  const bands = useMemo(() => {
    return nodes.reduce(
      (acc, node) => {
        acc[node.masteryBand] = (acc[node.masteryBand] ?? 0) + 1;
        return acc;
      },
      {
        mastered: 0,
        proficient: 0,
        developing: 0,
        low: 0,
      } as Record<string, number>,
    );
  }, [nodes]);

  if (!documentId) {
    router.replace("/space");
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Knowledge graph</h1>
          <p className="text-sm text-muted-foreground">
            Visualize how concepts connect and pick your next study focus.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/progress?documentId=${documentId}`)}
          >
            View progress
          </Button>
          <Button onClick={() => router.push(`/session?documentId=${documentId}`)}>
            Start session
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Graph preview</CardTitle>
          <CardDescription>Interactive view coming next</CardDescription>
        </CardHeader>
        <CardContent>
          {graphQuery.isLoading ? (
            <div className="flex h-[360px] items-center justify-center">
              <Spinner />
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              Upload a document and wait for processing to finish.
            </div>
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center gap-6 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p>
                Graph data loaded: {nodes.length} nodes · {edges.length} edges
              </p>
              <GraphLegend bands={bands} />
              <p>
                Select a concept below to inspect prerequisites and mastery
                details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Concepts</CardTitle>
          <CardDescription>Tap a node to inspect details.</CardDescription>
        </CardHeader>
        <CardContent>
          {graphQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-3 text-left transition hover:border-primary",
                      node.id === resolvedNodeId && "border-primary bg-primary/5",
                    )}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{node.title}</p>
                      <MasteryBar score={node.masteryScore} size="xs" showLabel />
                    </div>
                    <Badge variant={node.isLocked ? "outline" : "secondary"}>
                      {node.isLocked ? "Locked" : node.masteryBand}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <NodeDetailSheet
        open={Boolean(selectedNode)}
        node={selectedNode}
        prerequisites={prerequisites}
        unlocks={unlocks}
        onClose={() => setSelectedNodeId(null)}
        onStudy={() => router.push(`/session?documentId=${documentId}`)}
      />
    </div>
  );
}

function GraphLegend({
  bands,
}: {
  bands: Record<string, number>;
}) {
  const colors: Record<string, string> = {
    mastered: "bg-green-500",
    proficient: "bg-lime-500",
    developing: "bg-amber-500",
    low: "bg-red-500",
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
      {Object.entries(bands).map(([band, count]) => (
        <div key={band} className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", colors[band] ?? "bg-muted")}></span>
          <span className="uppercase tracking-wide">
            {band} · {count}
          </span>
        </div>
      ))}
    </div>
  );
}

interface NodeDetailSheetProps {
  open: boolean;
  node: GraphResponse["nodes"][number] | null;
  prerequisites: GraphResponse["nodes"][number][];
  unlocks: GraphResponse["nodes"][number][];
  onClose: () => void;
  onStudy: () => void;
}

function NodeDetailSheet({
  open,
  node,
  prerequisites,
  unlocks,
  onClose,
  onStudy,
}: NodeDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[420px]">
        {node ? (
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle>{node.title}</SheetTitle>
            </SheetHeader>
            <div className="flex items-center gap-3">
              <MasteryBar score={node.masteryScore} showLabel size="md" />
              <MasteryBadge band={node.masteryBand} />
            </div>
            <p className="text-sm text-muted-foreground">{node.description}</p>
            <Separator />
            {prerequisites.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Prerequisites
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {prerequisites.map((prereq) => (
                    <Badge key={prereq.id} variant="outline">
                      {prereq.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {unlocks.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Unlocks
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unlocks.map((unlock) => (
                    <Badge key={unlock.id} variant="secondary">
                      {unlock.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-full"
                  disabled={node.isLocked}
                  onClick={onStudy}
                >
                  {node.isLocked ? "Locked concept" : "Study this concept"}
                </Button>
              </TooltipTrigger>
              {node.isLocked && (
                <TooltipContent>Complete prerequisites first</TooltipContent>
              )}
            </Tooltip>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a concept from the list to view details.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
