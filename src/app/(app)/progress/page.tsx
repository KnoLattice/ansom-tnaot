"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/MasteryBar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { ProgressDashboardResponse } from "@/lib/types/api";
import { fromNow } from "@/lib/utils/format";

export default function ProgressPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const router = useRouter();

  const progressQuery = useQuery({
    queryKey: ["progress", documentId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProgressDashboardResponse>(
        API_ROUTES.PROGRESS.DASHBOARD,
        { params: { documentId } },
      );
      return data;
    },
    enabled: Boolean(documentId),
  });

  const avgAccuracy = useMemo(() => {
    const history = progressQuery.data?.sessionHistory ?? [];
    if (history.length === 0) return 0;
    const sum = history.reduce(
      (total, entry) => total + (entry.accuracyPercent ?? 0),
      0,
    );
    return Math.round(sum / history.length);
  }, [progressQuery.data?.sessionHistory]);

  if (!documentId) {
    // router.replace("/dashboard");
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (progressQuery.isLoading || !progressQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const data = progressQuery.data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Progress</h1>
          <p className="text-sm text-muted-foreground">
            {data.totalNodes} concepts · {data.overallMasteryPercent}% mastery
          </p>
        </div>
        <Button onClick={() => router.push(`/session?documentId=${documentId}`)}>
          Start review session
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{
          label: "Overall mastery",
          value: `${data.overallMasteryPercent}%`,
        },
        { label: "Total concepts", value: data.totalNodes },
        { label: "Sessions", value: data.sessionHistory.length },
        { label: "Avg accuracy", value: `${avgAccuracy}%` }].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Concepts below 50% mastery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weakNodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ✓ All concepts are currently on track.
              </p>
            ) : (
              data.weakNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{node.title}</p>
                    <MasteryBar score={node.masteryScore} showLabel size="xs" />
                  </div>
                  <Badge variant={urgencyVariant(node.urgency)}>
                    {node.urgency}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>Last 10 adaptive sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sessionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Start a session to see history here.
              </p>
            ) : (
              data.sessionHistory.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.totalInteractions} questions
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {session.accuracyPercent !== null
                      ? `${session.accuracyPercent}%`
                      : "–"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All concepts</CardTitle>
          <CardDescription>Tap a row to revisit the concept.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead>Mastery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.nodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">{node.title}</TableCell>
                  <TableCell>
                    <MasteryBar
                      score={node.masteryScore}
                      showLabel
                      size="xs"
                      animated={false}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={node.isLocked ? "outline" : "secondary"}>
                      {node.isLocked ? "Locked" : node.masteryBand}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {node.lastInteractionAt ? fromNow(node.lastInteractionAt) : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function urgencyVariant(
  urgency: "critical" | "high" | "medium",
): "default" | "secondary" | "destructive" {
  switch (urgency) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    default:
      return "secondary";
  }
}
