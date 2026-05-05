"use client";

import { use, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LayoutList, Network } from "lucide-react";
import { useGraph, useDocuments } from "@/lib/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DistributionStrip } from "@/components/surfaces/mastery-map/DistributionStrip";
import { ConceptListView, type FilterKey } from "@/components/surfaces/mastery-map/ConceptListView";
import { ConceptDetailPanel } from "@/components/surfaces/mastery-map/ConceptDetailPanel";
import { GraphView } from "@/components/surfaces/mastery-map/GraphView";
import { BatchActionBar } from "@/components/surfaces/mastery-map/BatchActionBar";
import { cn } from "@/lib/utils";

function MasteryMapContent({ docId }: { docId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeDocument } = useDocuments();
  const { data: graphData, isLoading, error } = useGraph(docId);

  const view = (searchParams.get("view") as "graph" | "list") || "graph";
  const setView = useCallback(
    (v: "graph" | "list") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", v);
      router.replace(`/mastery/${docId}?${params.toString()}`, { scroll: false });
    },
    [docId, router, searchParams],
  );

  const selectedNodeId = searchParams.get("node");
  const setSelectedNodeId = useCallback(
    (nodeId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nodeId) {
        params.set("node", nodeId);
      } else {
        params.delete("node");
      }
      router.replace(`/mastery/${docId}?${params.toString()}`, { scroll: false });
    },
    [docId, router, searchParams],
  );

  const filter = (searchParams.get("filter") as FilterKey) || "all";
  const setFilter = useCallback(
    (f: FilterKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (f === "all") {
        params.delete("filter");
      } else {
        params.set("filter", f);
      }
      router.replace(`/mastery/${docId}?${params.toString()}`, { scroll: false });
    },
    [docId, router, searchParams],
  );

  const selectedNode = useMemo(
    () => graphData?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graphData, selectedNodeId],
  );

  const filteredCount = useMemo(() => {
    if (!graphData || filter === "all") return 0;
    switch (filter) {
      case "below-mastered":
        return graphData.nodes.filter((n) => !n.isLocked && n.masteryScore < 0.7).length;
      case "mastered":
        return graphData.nodes.filter((n) => n.masteryScore >= 0.7).length;
      case "locked":
        return graphData.nodes.filter((n) => n.isLocked).length;
      default:
        return 0;
    }
  }, [graphData, filter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-[60vh]" />
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          UNABLE TO LOAD GRAPH
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {error instanceof Error ? error.message : "This document may not be processed yet."}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/library")}
        >
          BACK TO LIBRARY
        </Button>
      </div>
    );
  }

  const docName = activeDocument?.originalName ?? "Document";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-border-default)] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Mastery Map
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            {docName.replace(/\.[^.]+$/, "")} / {graphData.nodes.length} concepts
          </p>
        </div>

        {/* View switcher — brutalist toggle */}
        <div className="flex border border-[var(--color-border-default)]">
          <button
            type="button"
            onClick={() => setView("graph")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition",
              view === "graph"
                ? "bg-[var(--color-accent-primary)] text-black"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            <Network className="h-3.5 w-3.5" />
            GRAPH
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-2 border-l border-[var(--color-border-default)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition",
              view === "list"
                ? "bg-[var(--color-accent-primary)] text-black"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            LIST
          </button>
        </div>
      </div>

      {/* Distribution strip */}
      <DistributionStrip nodes={graphData.nodes} />

      {/* Main content: view + detail panel */}
      <div className="flex gap-4" style={{ minHeight: "60vh" }}>
        <div className="min-w-0 flex-1">
          {view === "graph" ? (
            <div className="h-[60vh] overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-canvas)]">
              <GraphView
                data={graphData}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>
          ) : (
            <ConceptListView
              nodes={graphData.nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
        </div>

        {selectedNode && (
          <div className="hidden w-[360px] shrink-0 lg:block">
            <div className="sticky top-16" style={{ maxHeight: "calc(100vh - 5rem)" }}>
              <ConceptDetailPanel
                node={selectedNode}
                allNodes={graphData.nodes}
                edges={graphData.edges}
                onSelectNode={setSelectedNodeId}
                onClose={() => setSelectedNodeId(null)}
                documentId={docId}
              />
            </div>
          </div>
        )}
      </div>

      {view === "list" && (
        <BatchActionBar
          conceptCount={filteredCount}
          documentId={docId}
          visible={filter !== "all" && filteredCount > 0}
        />
      )}
    </div>
  );
}

export default function MasteryMapPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <MasteryMapContent docId={docId} />
    </Suspense>
  );
}
