"use client";

import { AlertTriangle, CalendarClock, Handshake, Inbox } from "lucide-react";

import { useInfluencerDashboard } from "@/hooks/use-influencer-dashboard";
import { COLLABORATION_STATUSES, STATUS_LABELS } from "@/lib/types";
import type { CollaborationStatus } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CollaborationCard } from "@/components/collaborations/collaboration-card";

export function InfluencerDashboard() {
  const {
    loading,
    error,
    overdue,
    upcoming,
    filtered,
    collaborations,
    statusFilter,
    setStatusFilter,
  } = useInfluencerDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Empty state - no collaborations at all
  if (collaborations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">
          Noch keine Kooperationen zugewiesen
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Dein Manager wird dich benachrichtigen, sobald es losgeht! Hier
          erscheinen dann alle deine zugewiesenen Kooperationen.
        </p>
      </div>
    );
  }

  const statusTabs: { value: CollaborationStatus | "all"; label: string }[] = [
    { value: "all", label: `Alle (${collaborations.length})` },
    ...COLLABORATION_STATUSES.filter((s) => s !== "declined").map((s) => ({
      value: s,
      label: `${STATUS_LABELS[s]} (${collaborations.filter((c) => c.status === s).length})`,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Overdue section */}
      {overdue.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">
              Ueberfaellig ({overdue.length})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {overdue.map((c) => (
              <CollaborationCard
                key={c.id}
                collaboration={c}
                showOverdueWarning
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming section */}
      {upcoming.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">
              Anstehend - naechste 7 Tage ({upcoming.length})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c) => (
              <CollaborationCard key={c.id} collaboration={c} />
            ))}
          </div>
        </section>
      )}

      {/* All collaborations with filter */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Alle meine Kooperationen</h2>
        </div>

        {/* Status filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Badge
              key={tab.value}
              variant={statusFilter === tab.value ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </Badge>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CollaborationCard key={c.id} collaboration={c} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Keine Kooperationen mit diesem Status gefunden.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
