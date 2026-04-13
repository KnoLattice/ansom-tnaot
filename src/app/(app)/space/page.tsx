"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SpaceCanvas } from "@/components/graph/SpaceCanvas";
import { NodeDetailPanel } from "@/components/graph/NodeDetailPanel";
import { DocumentSwitcher } from "@/components/hud/DocumentSwitcher";
import { MasteryRingPanel } from "@/components/hud/MasteryRingPanel";
import { SessionCTA } from "@/components/hud/SessionCTA";
import { QuickUploadPopup } from "@/components/hud/QuickUploadPopup";
import { Spinner } from "@/components/ui/Spinner";
import { useDocuments } from "@/lib/hooks";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { GraphResponse, WeakNode } from "@/lib/types/api";
import { useGraphStore } from "@/store/graph.store";
import { cn } from "@/lib/utils";

export default function SpacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
    activeDocument,
  } = useDocuments();
  const selectNode = useGraphStore((state) => state.selectNode);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);

  // Sync query param -> active document
  useEffect(() => {
    const docId = searchParams.get("documentId");
    if (docId) setActiveDocument(docId);
  }, [searchParams, setActiveDocument]);

  const graphQuery = useQuery({
    queryKey: ["graph", activeDocumentId],
    queryFn: async () => {
      const { data } = await apiClient.get<GraphResponse>(API_ROUTES.GRAPH.TOPOLOGY, {
        params: { documentId: activeDocumentId },
      });
      return data;
    },
    enabled: Boolean(activeDocumentId) && activeDocument?.processingStatus === "completed",
    staleTime: 30_000,
  });

  const weakNodesQuery = useQuery({
    queryKey: ["weak-nodes", activeDocumentId],
    queryFn: async () => {
      const { data } = await apiClient.get<WeakNode[]>(API_ROUTES.GRAPH.WEAK_NODES, {
        params: { documentId: activeDocumentId },
      });
      return data;
    },
    enabled: Boolean(activeDocumentId) && activeDocument?.processingStatus === "completed",
  });

  const nodes = useMemo(() => graphQuery.data?.nodes ?? [], [graphQuery.data?.nodes]);
  const edges = useMemo(() => graphQuery.data?.edges ?? [], [graphQuery.data?.edges]);
  const selectedNode = useMemo(() => {
    if (!nodes.length) return null;
    const direct = nodes.find((node) => node.id === selectedNodeId);
    if (direct) return direct;
    return nodes.find((node) => !node.isLocked) ?? nodes[0];
  }, [nodes, selectedNodeId]);

  const prerequisites = useMemo(() => {
    if (!selectedNode) return [];
    const prereqIds = edges
      .filter((edge) => edge.relationshipType === "prerequisite" && edge.targetNodeId === selectedNode.id)
      .map((edge) => edge.sourceNodeId);
    return nodes.filter((node) => prereqIds.includes(node.id));
  }, [edges, nodes, selectedNode]);

  const unlocks = useMemo(() => {
    if (!selectedNode) return [];
    const unlockIds = edges
      .filter((edge) => edge.relationshipType === "prerequisite" && edge.sourceNodeId === selectedNode.id)
      .map((edge) => edge.targetNodeId);
    return nodes.filter((node) => unlockIds.includes(node.id));
  }, [edges, nodes, selectedNode]);

  const highlightSet = useMemo(() => {
    if (!selectedNode) return undefined;
    return new Set<string>([
      selectedNode.id,
      ...prerequisites.map((n) => n.id),
      ...unlocks.map((n) => n.id),
    ]);
  }, [prerequisites, selectedNode, unlocks]);

  const handleDocumentChange = (id: string) => {
    setActiveDocument(id);
    router.replace(`/space?documentId=${id}`);
    selectNode(null);
  };

  const handleStartSession = () => {
    if (!activeDocumentId) {
      toast.error("Select a document first");
      return;
    }
    router.push(`/session?documentId=${activeDocumentId}`);
  };

  const handleUpload = () => router.push("/library");

  const showProcessingBanner = activeDocument && activeDocument.processingStatus !== "completed";

  return (
    <div className="relative min-h-screen">
      <SpaceCanvas
        data={graphQuery.data}
        selectedNodeId={selectedNode?.id ?? null}
        onSelectNode={selectNode}
        highlightNodeIds={highlightSet}
      />

      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between">
        <div className="flex flex-col gap-4 px-6 pt-24 lg:flex-row lg:items-start">
          <div className="flex w-full max-w-sm flex-col gap-4">
            {selectedNode && (
              <NodeSummaryCard
                node={selectedNode}
                childrenCount={unlocks.length}
                prereqCount={prerequisites.length}
                onViewChildren={() => {
                  if (unlocks[0]) selectNode(unlocks[0].id);
                }}
              />
            )}
            {weakNodesQuery.data && weakNodesQuery.data.length === 0 && documents.length > 0 && !showProcessingBanner && (
              <div className="pointer-events-auto rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
                All concepts are currently stable. Keep exploring!
              </div>
            )}
          </div>
          <div className="ml-auto flex w-full max-w-md flex-col gap-4">
            {documents.length > 0 && (
              <DocumentSwitcher
                documents={documents}
                activeDocumentId={activeDocumentId}
                onSelect={handleDocumentChange}
                onUpload={handleUpload}
              />
            )}
            <div className="kl-glass-panel pointer-events-auto max-h-[70vh] overflow-y-auto rounded-3xl p-6 text-white">
              <NodeDetailPanel
                node={selectedNode}
                prerequisites={prerequisites}
                unlocks={unlocks}
                onSelectNode={(nodeId) => selectNode(nodeId)}
                onStudy={handleStartSession}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="pointer-events-auto w-full max-w-lg space-y-4">
            <MasteryRingPanel nodes={nodes} />
            {unlocks.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-[rgba(8,9,18,0.85)] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Child nodes</p>
                <p className="mt-1 text-sm text-white/70">
                  These concepts unlock when you master <span className="font-semibold">{selectedNode?.title}</span>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {unlocks.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => selectNode(child.id)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="pointer-events-auto w-full max-w-xs lg:ml-auto">
            <SessionCTA onStart={handleStartSession} disabled={!selectedNode || selectedNode.isLocked} />
          </div>
        </div>

        {documents.length === 0 && (
          <div className="pointer-events-auto px-6 pb-8">
            <QuickUploadPopup onUpload={handleUpload} />
          </div>
        )}
      </div>

      {showProcessingBanner && (
        <div className="fixed inset-x-0 top-20 z-30 mx-auto flex max-w-2xl items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-white">
          <Spinner size="sm" />
          <p>Your knowledge graph is being generated. This takes around 45 seconds.</p>
        </div>
      )}

      {graphQuery.isLoading && !showProcessingBanner && (
        <div className="fixed inset-0 z-0 grid place-items-center text-white/70">
          <Spinner />
        </div>
      )}

      {graphQuery.isError && (
        <div className="fixed inset-x-0 top-1/2 z-30 mx-auto max-w-md rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-200">
          Unable to load graph data. Please retry later.
        </div>
      )}
    </div>
  );
}

function NodeSummaryCard({
  node,
  childrenCount,
  prereqCount,
  onViewChildren,
}: {
  node: GraphResponse["nodes"][number];
  childrenCount: number;
  prereqCount: number;
  onViewChildren: () => void;
}) {
  return (
    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-[rgba(8,9,18,0.85)] p-5 text-white shadow-panel">
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">Concept summary</p>
      <h2 className="mt-2 font-display text-2xl">{node.title}</h2>
      <p className="mt-2 text-sm text-white/70 line-clamp-3">
        {node.description || "Description unavailable for this concept yet."}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <SummaryStat label="Prerequisites" value={`${prereqCount}`} />
        <SummaryStat label="Children" value={`${childrenCount}`} />
      </div>
      <button
        type="button"
        onClick={onViewChildren}
        className={cn(
          "mt-4 w-full rounded-2xl border border-white/15 py-2 text-sm font-medium text-white transition",
          childrenCount === 0 && "pointer-events-none opacity-50",
        )}
      >
        {childrenCount > 0 ? "Jump to a child concept" : "No child nodes"}
      </button>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
