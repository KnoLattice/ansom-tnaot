"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Clock, Target, Lightbulb } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { Spinner } from "@/components/ui/Spinner";
import type { SessionAnalysis } from "@/lib/types/api";

interface AIAnalysisSectionProps {
  sessionId: string;
}

const SECTION_DELAY = 0.1;

function SectionCard({
  icon,
  label,
  delay,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="space-y-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="kl-data-label">{label}</p>
      </div>
      {children}
    </motion.div>
  );
}

function NodeCard({
  node,
  delay,
}: {
  node: SessionAnalysis["nodeAnalysis"][number];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
      className="border-l-2 border-l-[var(--color-accent-primary)] bg-[var(--color-surface-elevated)] px-4 py-3 space-y-2"
    >
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {node.nodeTitle}
      </p>
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {node.assessment}
      </p>
      {node.strengths.length > 0 && (
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-green-400">
            Strengths
          </p>
          <ul className="mt-1 space-y-0.5">
            {node.strengths.map((s, i) => (
              <li
                key={i}
                className="text-xs text-[var(--color-text-secondary)]"
              >
                + {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {node.weaknesses.length > 0 && (
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400">
            Needs Work
          </p>
          <ul className="mt-1 space-y-0.5">
            {node.weaknesses.map((w, i) => (
              <li
                key={i}
                className="text-xs text-[var(--color-text-secondary)]"
              >
                - {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center gap-2">
        <Spinner size="sm" label={false} />
        <p className="kl-data-label animate-pulse">
          GENERATING AI ANALYSIS...
        </p>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-[var(--color-border-subtle)]"
            style={{ width: `${90 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AIAnalysisSection({ sessionId }: AIAnalysisSectionProps) {
  const { data: analysis, isLoading, error } = useQuery<SessionAnalysis>({
    queryKey: ["sessionAnalysis", sessionId],
    queryFn: async () => {
      const { data } = await apiClient.post<SessionAnalysis>(
        API_ROUTES.SESSIONS.ANALYSIS(sessionId),
      );
      return data;
    },
    retry: 1,
    staleTime: Infinity,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (error || !analysis) {
    return (
      <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          AI analysis unavailable
        </p>
      </div>
    );
  }

  const hasNodeAnalysis = analysis.nodeAnalysis.length > 0;
  const hasTypeInsights = Object.keys(analysis.questionTypeInsights).length > 0;
  const hasPlan = analysis.improvementPlan.length > 0;

  return (
    <div className="space-y-3">
      <hr className="border-[var(--color-border-subtle)]" />
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-[var(--color-accent-primary)]" />
        <p className="kl-data-label">AI Performance Analysis</p>
      </div>

      {/* Overall Summary */}
      {analysis.overallSummary && (
        <SectionCard
          icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
          label="Overall Assessment"
          delay={SECTION_DELAY}
        >
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {analysis.overallSummary}
          </p>
        </SectionCard>
      )}

      {/* Per-Node Breakdown */}
      {hasNodeAnalysis && (
        <SectionCard
          icon={<Target className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
          label="Concept Breakdown"
          delay={SECTION_DELAY * 2}
        >
          <div className="space-y-2">
            {analysis.nodeAnalysis.map((node, i) => (
              <NodeCard
                key={node.nodeId}
                node={node}
                delay={SECTION_DELAY * 2 + i * 0.05}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Question Type Insights */}
      {hasTypeInsights && (
        <SectionCard
          icon={<Brain className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
          label="Question Type Insights"
          delay={SECTION_DELAY * 3}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(analysis.questionTypeInsights).map(
              ([type, insight]) => (
                <div
                  key={type}
                  className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2"
                >
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
                    {type.replace("_", " ")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {insight}
                  </p>
                </div>
              ),
            )}
          </div>
        </SectionCard>
      )}

      {/* Bloom's + Timing row */}
      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.bloomLevelAnalysis && (
          <SectionCard
            icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
            label="Cognitive Level"
            delay={SECTION_DELAY * 4}
          >
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {analysis.bloomLevelAnalysis}
            </p>
          </SectionCard>
        )}
        {analysis.responseTimeInsights && (
          <SectionCard
            icon={<Clock className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
            label="Response Timing"
            delay={SECTION_DELAY * 4}
          >
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {analysis.responseTimeInsights}
            </p>
          </SectionCard>
        )}
      </div>

      {/* Improvement Plan */}
      {hasPlan && (
        <SectionCard
          icon={<Lightbulb className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />}
          label="Improvement Plan"
          delay={SECTION_DELAY * 5}
        >
          <ol className="space-y-2">
            {analysis.improvementPlan.map((item, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}
