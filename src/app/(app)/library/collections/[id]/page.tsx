"use client";

import { use, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpDown, Pencil, Play } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCollectionMastery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const BAND_COLORS = {
  mastered: "#22c55e",
  proficient: "#84cc16",
  developing: "#eab308",
  low: "#ef4444",
};

const BAND_LABELS = {
  mastered: "Mastered",
  proficient: "Proficient",
  developing: "Developing",
  low: "Low",
};

type SortKey = "mastery-asc" | "mastery-desc" | "name";

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: collectionId } = use(params);
  const router = useRouter();
  const { data: mastery, isLoading } = useCollectionMastery(collectionId);
  const [sortBy, setSortBy] = useState<SortKey>("mastery-asc");
  const [isEditingName, setIsEditingName] = useState(false);

  const hasCompleteDocuments = useMemo(
    () =>
      mastery?.perDocument.some((d) => d.processingStatus === "completed") ??
      false,
    [mastery],
  );

  const bandData = useMemo(() => {
    if (!mastery) return [];
    return (
      Object.entries(mastery.masteryBands) as [
        keyof typeof BAND_COLORS,
        number,
      ][]
    )
      .filter(([, count]) => count > 0)
      .map(([band, count]) => ({
        name: BAND_LABELS[band],
        value: count,
        color: BAND_COLORS[band],
      }));
  }, [mastery]);

  const sortedDocuments = useMemo(() => {
    if (!mastery) return [];
    const docs = [...mastery.perDocument];
    if (sortBy === "name") {
      docs.sort((a, b) => a.originalName.localeCompare(b.originalName));
    } else if (sortBy === "mastery-asc") {
      docs.sort((a, b) => (a.mastery ?? -1) - (b.mastery ?? -1));
    } else {
      docs.sort((a, b) => (b.mastery ?? -1) - (a.mastery ?? -1));
    }
    return docs;
  }, [mastery, sortBy]);

  const handleStartSession = useCallback(() => {
    router.push(`/session/new?collectionId=${collectionId}`);
  }, [router, collectionId]);

  const cycleSortKey = useCallback(() => {
    setSortBy((s) => {
      if (s === "mastery-asc") return "mastery-desc";
      if (s === "mastery-desc") return "name";
      return "mastery-asc";
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!mastery) {
    return (
      <div className="py-20 text-center text-[var(--color-text-muted)]">
        Collection not found.
      </div>
    );
  }

  const overallPercent =
    mastery.overallMastery !== null
      ? Math.round(mastery.overallMastery * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/library")}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Library
      </button>

      {/* Collection name */}
      <div>
        <h1 className="font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          {/* We show the collection name from the first document's context; the
              mastery endpoint doesn't return the name directly, but we can get
              it from the URL and local state. For now, show a generic heading. */}
          Collection
        </h1>
      </div>

      {/* Mastery overview card */}
      <div className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          {/* Ring chart */}
          <div className="relative h-48 w-48 shrink-0">
            {bandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {bandData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "4px",
                      color: "var(--color-text-primary)",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [
                      `${value} nodes`,
                      String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  No data yet
                </span>
              </div>
            )}
            {/* Center label */}
            {overallPercent !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">
                  {overallPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Overall Mastery
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {mastery.totalNodes} concept
                {mastery.totalNodes !== 1 ? "s" : ""} across{" "}
                {mastery.perDocument.length} document
                {mastery.perDocument.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Band legend */}
            <div className="flex flex-wrap gap-4">
              {(
                Object.entries(mastery.masteryBands) as [
                  keyof typeof BAND_COLORS,
                  number,
                ][]
              ).map(([band, count]) => (
                <div key={band} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: BAND_COLORS[band] }}
                  />
                  <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                    {BAND_LABELS[band]} ({count})
                  </span>
                </div>
              ))}
            </div>

            {/* Last reviewed */}
            {mastery.lastReviewed && (
              <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
                Last reviewed {dayjs(mastery.lastReviewed).fromNow()}
              </p>
            )}

            {/* CTA */}
            <Button
              className="border rounded-md"
              disabled={!hasCompleteDocuments}
              onClick={handleStartSession}
              title={
                !hasCompleteDocuments
                  ? "Add and process at least one document to study"
                  : undefined
              }
            >
              <Play className="mr-2 h-4 w-4" />
              START COLLECTION SESSION
            </Button>
          </div>
        </div>
      </div>

      {/* Per-document table */}
      <div className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Documents in this collection
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-[10px]"
            onClick={cycleSortKey}
          >
            <ArrowUpDown className="mr-1.5 h-3 w-3" />
            SORT:{" "}
            {sortBy === "mastery-asc"
              ? "MASTERY ASC"
              : sortBy === "mastery-desc"
                ? "MASTERY DESC"
                : "NAME"}
          </Button>
        </div>

        {sortedDocuments.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
            No documents in this collection yet.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {sortedDocuments.map((doc) => (
              <button
                key={doc.documentId}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[var(--color-surface-elevated)]"
                onClick={() => {
                  if (doc.processingStatus === "completed") {
                    router.push(`/mastery/${doc.documentId}`);
                  }
                }}
              >
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-primary)]">
                  {doc.originalName}
                </span>

                {/* Mastery */}
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-bold",
                    doc.mastery !== null
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-muted)]",
                  )}
                >
                  {doc.mastery !== null
                    ? `${Math.round(doc.mastery * 100)}%`
                    : doc.processingStatus === "completed"
                      ? "N/A"
                      : ""}
                </span>

                {/* Status or node count */}
                {doc.processingStatus !== "completed" ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-sm border border-[var(--color-border-subtle)] text-[10px] text-yellow-400"
                  >
                    {doc.processingStatus === "processing"
                      ? "PROCESSING..."
                      : doc.processingStatus === "failed"
                        ? "FAILED"
                        : "PENDING"}
                  </Badge>
                ) : (
                  <span className="shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]">
                    {doc.nodeCount} node{doc.nodeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
