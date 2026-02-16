"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CollaborationStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

interface StatusBadgeProps {
  status: CollaborationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {label}
    </Badge>
  );
}
