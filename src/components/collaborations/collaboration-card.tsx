"use client";

import Link from "next/link";
import { Calendar, Building2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow, isPast, parseISO, format } from "date-fns";
import { de } from "date-fns/locale";

import type { CollaborationWithRelations } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/collaborations/status-badge";

interface CollaborationCardProps {
  collaboration: CollaborationWithRelations;
  showOverdueWarning?: boolean;
}

export function CollaborationCard({
  collaboration,
  showOverdueWarning = false,
}: CollaborationCardProps) {
  const overdue =
    collaboration.deadline &&
    collaboration.status !== "completed" &&
    collaboration.status !== "declined" &&
    isPast(parseISO(collaboration.deadline));

  return (
    <Link href={`/cooperations/${collaboration.id}`}>
      <Card
        className={`transition-colors hover:bg-accent/50 cursor-pointer ${
          showOverdueWarning && overdue
            ? "border-destructive/50 bg-destructive/5"
            : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {collaboration.title}
            </CardTitle>
            <StatusBadge status={collaboration.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Company */}
          {collaboration.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{collaboration.company.name}</span>
            </div>
          )}

          {/* Deadline */}
          {collaboration.deadline && (
            <div
              className={`flex items-center gap-2 text-sm ${
                overdue
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {overdue ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Calendar className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {format(parseISO(collaboration.deadline), "dd. MMM yyyy", {
                  locale: de,
                })}
                {" ("}
                {formatDistanceToNow(parseISO(collaboration.deadline), {
                  locale: de,
                  addSuffix: true,
                })}
                {")"}
              </span>
            </div>
          )}

          {/* No deadline set */}
          {!collaboration.deadline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="italic">Keine Deadline</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
