"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Exploration,
  ExplorationResource,
  ExplorationResourceStatus,
} from "@/lib/types/api";
import { cn } from "@/lib/utils";
import {
  Search,
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
          className="h-11 border-border-default bg-white/5 text-text-primary placeholder:text-text-muted"
          disabled={createExploration.isPending}
        />
      </div>
      <Button
        type="submit"
        disabled={!query.trim() || createExploration.isPending}
        className="h-11 px-6 bg-accent-primary text-white shadow-glow hover:opacity-90"
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
    "border-border-default bg-white/5",
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
  pending: { label: "Pending", className: "bg-white/10 text-text-muted" },
  accepted: { label: "Accepted", className: "bg-blue-500/20 text-blue-400" },
  rejected: { label: "Rejected", className: "bg-red-500/20 text-red-400" },
  fetching: { label: "Fetching", className: "bg-amber-500/20 text-amber-400" },
  processing: { label: "Processing", className: "bg-amber-500/20 text-amber-400" },
  completed: { label: "Completed", className: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "Failed", className: "bg-red-500/20 text-red-400" },
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
        "rounded-xl border p-4 transition-all",
        STATUS_STYLES[resource.status],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {resource.title}
            </h4>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
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
            className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {new URL(resource.url).hostname}
          </a>
          <p className="mt-2 text-xs text-text-secondary line-clamp-2">
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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-text-muted">
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
          className="text-text-muted hover:text-text-primary"
        >
          ← Back
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-text-primary">
            {exploration.query}
          </h2>
          <p className="text-xs text-text-muted">
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
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
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
          className="w-full bg-accent-primary text-white shadow-glow hover:opacity-90"
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
        <div className="py-16 text-center text-text-muted text-sm">
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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!explorations || explorations.length === 0) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-text-muted mb-3" />
        <p className="text-sm text-text-muted">
          No explorations yet. Search for a topic above to get started.
        </p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    searching: "bg-amber-500/20 text-amber-400",
    review: "bg-blue-500/20 text-blue-400",
    processing: "bg-blue-500/20 text-blue-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-2">
      {explorations.map((exp) => (
        <button
          key={exp.id}
          onClick={() => onSelect(exp.id)}
          className="w-full rounded-xl border border-border-default bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {exp.query}
              </p>
              <p className="text-xs text-text-muted">
                {new Date(exp.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                  statusColor[exp.status] ?? "bg-white/10 text-text-muted",
                )}
              >
                {exp.status}
              </span>
              <ArrowRight className="h-4 w-4 text-text-muted" />
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
        <h1 className="text-xl font-semibold text-text-primary">Explore</h1>
        <p className="text-sm text-text-muted mt-1">
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
