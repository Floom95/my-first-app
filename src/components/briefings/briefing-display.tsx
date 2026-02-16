"use client";

import {
  Target,
  Users,
  Package,
  Hash,
  ThumbsUp,
  BookOpen,
  Calendar,
  DollarSign,
  StickyNote,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

import type { Briefing } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BriefingDisplayProps {
  briefing: Briefing;
}

interface BriefingFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  isMultiline?: boolean;
}

function BriefingField({
  icon: Icon,
  label,
  value,
  isMultiline = false,
}: BriefingFieldProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd
          className={`text-sm mt-0.5 ${
            isMultiline ? "whitespace-pre-wrap" : ""
          }`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

export function BriefingDisplay({ briefing }: BriefingDisplayProps) {
  const postingPeriod =
    briefing.posting_period_start || briefing.posting_period_end
      ? [
          briefing.posting_period_start
            ? format(parseISO(briefing.posting_period_start), "dd. MMMM yyyy", {
                locale: de,
              })
            : null,
          briefing.posting_period_end
            ? format(parseISO(briefing.posting_period_end), "dd. MMMM yyyy", {
                locale: de,
              })
            : null,
        ]
          .filter(Boolean)
          .join(" - ")
      : null;

  return (
    <div className="space-y-4">
      {/* Goals & Audience Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ziele & Zielgruppe</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <BriefingField
              icon={Target}
              label="Kampagnenziel"
              value={briefing.campaign_goal}
              isMultiline
            />
            <BriefingField
              icon={Users}
              label="Zielgruppe"
              value={briefing.target_audience}
              isMultiline
            />
          </dl>
        </CardContent>
      </Card>

      {/* Content Section */}
      {(briefing.deliverables ||
        briefing.hashtags ||
        briefing.dos_donts ||
        briefing.content_guidelines) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <BriefingField
                icon={Package}
                label="Deliverables"
                value={briefing.deliverables}
                isMultiline
              />
              <BriefingField
                icon={Hash}
                label="Hashtags & Mentions"
                value={briefing.hashtags}
                isMultiline
              />
              <BriefingField
                icon={ThumbsUp}
                label="Do's & Don'ts"
                value={briefing.dos_donts}
                isMultiline
              />
              <BriefingField
                icon={BookOpen}
                label="Content-Richtlinien"
                value={briefing.content_guidelines}
                isMultiline
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Timeline & Compensation Section */}
      {(postingPeriod || briefing.compensation || briefing.notes) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Timeline & Verguetung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <BriefingField
                icon={Calendar}
                label="Posting-Zeitraum"
                value={postingPeriod}
              />
              <BriefingField
                icon={DollarSign}
                label="Verguetung"
                value={briefing.compensation}
              />
              <BriefingField
                icon={StickyNote}
                label="Zusaetzliche Notizen"
                value={briefing.notes}
                isMultiline
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Separator />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          Zuletzt aktualisiert:{" "}
          {format(parseISO(briefing.updated_at), "dd. MMMM yyyy, HH:mm", {
            locale: de,
          })}{" "}
          Uhr
        </span>
      </div>
    </div>
  );
}
