"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useExplorations,
  useExploration,
  useCreateExploration,
  useAcceptResource,
  useRejectResource,
  useAcceptAllResources,
  useDeleteExploration,
} from "@/lib/hooks";
import type {
  ExplorationResource,
  ExplorationResourceStatus,
} from "@/lib/types/api";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Check,
  X,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ─── Search Form ──────────────────────────────────────

function SearchForm({
  onCreated,
}: {
  onCreated: (explorationId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const createExploration = useCreateExploration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const result = await createExploration.mutateAsync({ query: query.trim() });
    setQuery("");
    onCreated(result.exploration.id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Introduction to Machine Learning, Data Structures in Python..."
          className="h-11 rounded-[var(--radius-input)]"
          disabled={createExploration.isPending}
        />
      </div>
      <Button
        type="submit"
        disabled={!query.trim() || createExploration.isPending}
        className="h-11 px-6 rounded-[var(--radius-button)] bg-[var(--color-accent-primary)] text-white shadow-glow hover:brightness-110"
      >
        {createExploration.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Explore
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Resource Card ────────────────────────────────────

const STATUS_STYLES: Record<ExplorationResourceStatus, string> = {
  pending:
    "border-[var(--color-border-default)] bg-[var(--color-surface)]",
  accepted:
    "border-blue-500/40 bg-blue-500/5",
  rejected:
    "border-red-500/30 bg-red-500/5 opacity-60",
  fetching:
    "border-amber-500/40 bg-amber-500/5",
  processing:
    "border-amber-500/40 bg-amber-500/5",
  completed:
    "border-emerald-500/40 bg-emerald-500/5",
  failed:
    "border-red-500/30 bg-red-500/5",
};

const STATUS_BADGE: Record<ExplorationResourceStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-[var(--color-text-muted)] border-[var(--color-border-default)]" },
  accepted: { label: "Accepted", className: "text-blue-400 border-blue-500" },
  rejected: { label: "Rejected", className: "text-red-400 border-red-500" },
  fetching: { label: "Fetching", className: "text-amber-400 border-amber-500" },
  processing: { label: "Processing", className: "text-amber-400 border-amber-500" },
  completed: { label: "Completed", className: "text-emerald-400 border-emerald-500" },
  failed: { label: "Failed", className: "text-red-400 border-red-500" },
};

function ResourceCard({
  resource,
  explorationId,
}: {
  resource: ExplorationResource;
  explorationId: string;
}) {
  const acceptResource = useAcceptResource();
  const rejectResource = useRejectResource();
  const isPending = resource.status === "pending";
  const badge = STATUS_BADGE[resource.status];

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-4 transition-all",
        STATUS_STYLES[resource.status],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-xs text-[var(--color-text-primary)] truncate">
              {resource.title}
            </h4>
            <span
              className={cn(
                "inline-flex items-center shrink-0 border px-1.5 py-0.5 text-xs font-bold",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-primary)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {new URL(resource.url).hostname}
          </a>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)] line-clamp-2">
            {resource.description}
          </p>
          {resource.errorMessage && (
            <p className="mt-2 text-xs text-red-400">
              Error: {resource.errorMessage}
            </p>
          )}
        </div>

        {isPending && (
          <div className="flex gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() =>
                acceptResource.mutate({
                  explorationId,
                  resourceId: resource.id,
                })
              }
              disabled={acceptResource.isPending}
              title="Accept"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
              onClick={() =>
                rejectResource.mutate({
                  explorationId,
                  resourceId: resource.id,
                })
              }
              disabled={rejectResource.isPending}
              title="Reject"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {(resource.status === "fetching" || resource.status === "processing") && (
          <Loader2 className="h-4 w-4 animate-spin text-amber-400 shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}

// ─── Exploration Detail ───────────────────────────────

function ExplorationDetail({
  explorationId,
  onBack,
}: {
  explorationId: string;
  onBack: () => void;
}) {
  const { data, isLoading } = useExploration(explorationId);
  const acceptAll = useAcceptAllResources();
  const deleteExploration = useDeleteExploration();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-xs text-[var(--color-text-muted)]">
        Exploration not found.
      </div>
    );
  }

  const { exploration, resources } = data;
  const pendingCount = resources.filter((r) => r.status === "pending").length;
  const completedCount = resources.filter((r) => r.status === "completed").length;
  const isSearching = exploration.status === "searching";
  const isProcessing = exploration.status === "processing";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          ← Back
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-sm text-[var(--color-text-primary)]">
            {exploration.query}
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {resources.length} resources found
            {completedCount > 0 && ` · ${completedCount} processed`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:bg-red-500/10"
          onClick={() =>
            deleteExploration.mutate(explorationId, { onSuccess: onBack })
          }
          disabled={deleteExploration.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {(isSearching || isProcessing) && (
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isSearching
            ? "AI is searching the web for resources..."
            : "Processing accepted resources..."}
        </div>
      )}

      {pendingCount > 0 && (
        <Button
          onClick={() => acceptAll.mutate(explorationId)}
          disabled={acceptAll.isPending}
          className="w-full rounded-[var(--radius-button)] bg-[var(--color-accent-primary)] text-white shadow-glow hover:brightness-110"
        >
          <Check className="mr-2 h-4 w-4" />
          Accept All ({pendingCount} pending)
        </Button>
      )}

      <div className="space-y-3">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            explorationId={explorationId}
          />
        ))}
      </div>

      {resources.length === 0 && !isSearching && (
        <div className="py-16 text-center text-xs text-[var(--color-text-muted)]">
          No resources found for this query.
        </div>
      )}
    </div>
  );
}

// ─── Exploration List ─────────────────────────────────

function ExplorationList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { data: explorations, isLoading } = useExplorations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (!explorations || explorations.length === 0) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--color-text-muted)] mb-3" />
        <p className="text-xs text-[var(--color-text-muted)]">
          No explorations yet. Search for a topic above to get started.
        </p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    searching: "text-amber-400 border-amber-500",
    review: "text-blue-400 border-blue-500",
    processing: "text-blue-400 border-blue-500",
    completed: "text-emerald-400 border-emerald-500",
    failed: "text-red-400 border-red-500",
  };

  return (
    <div className="space-y-2">
      {explorations.map((exp) => (
        <button
          key={exp.id}
          onClick={() => onSelect(exp.id)}
          className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 text-left transition-all hover:border-[var(--color-accent-primary)]/50"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                {exp.query}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {new Date(exp.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center shrink-0 border px-1.5 py-0.5 text-xs font-bold",
                  statusColor[exp.status] ?? "text-[var(--color-text-muted)] border-[var(--color-border-subtle)]",
                )}
              >
                {exp.status}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────

export default function ExplorationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="kl-data-label">Discover</p>
        <h1 className="font-bold text-sm text-[var(--color-text-primary)]">
          Explore
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          AI-powered web search to discover learning resources on any topic.
        </p>
      </div>

      {selectedId ? (
        <ExplorationDetail
          explorationId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <>
          <SearchForm onCreated={setSelectedId} />
          <ExplorationList onSelect={setSelectedId} />
        </>
      )}
    </div>
  );
}
