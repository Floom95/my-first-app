"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Handshake,
  Building2,
  User,
  Calendar,
  StickyNote,
  Pencil,
  Trash2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { de } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import {
  useCollaborationDetail,
  useCollaborationOptions,
} from "@/hooks/use-collaborations";
import { useCollaborations } from "@/hooks/use-collaborations";
import type { CollaborationFormValues } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/collaborations/status-badge";
import { CollaborationForm } from "@/components/collaborations/collaboration-form";
import { DeleteConfirmDialog } from "@/components/companies/delete-confirm-dialog";

export default function CooperationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collaborationId = params.id as string;

  const { isAdmin } = useAuth();
  const { collaboration, loading, error, refresh } =
    useCollaborationDetail(collaborationId);
  const { updateCollaboration, deleteCollaboration } = useCollaborations();
  const { companies, influencers } = useCollaborationOptions();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleUpdate(values: CollaborationFormValues) {
    const result = await updateCollaboration(collaborationId, values);
    if (result) {
      refresh();
    }
    return result;
  }

  async function handleDelete() {
    await deleteCollaboration(collaborationId);
    router.push("/cooperations");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !collaboration) {
    return (
      <div className="space-y-6">
        <Link
          href="/cooperations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Uebersicht
        </Link>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            {error || "Kooperation nicht gefunden"}
          </p>
        </div>
      </div>
    );
  }

  const overdue =
    collaboration.deadline &&
    collaboration.status !== "completed" &&
    collaboration.status !== "declined" &&
    isPast(parseISO(collaboration.deadline));

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/cooperations"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zur Uebersicht
      </Link>

      {/* Collaboration header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Handshake className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {collaboration.title}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={collaboration.status} />
              {overdue && (
                <span className="flex items-center gap-1 text-sm text-destructive font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Ueberfaellig
                </span>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Loeschen
            </Button>
          </div>
        )}
      </div>

      {/* Collaboration details card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kooperationsdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Unternehmen
                </dt>
                <dd className="text-sm">
                  {collaboration.company ? (
                    <Link
                      href={`/companies/${collaboration.company.id}`}
                      className="text-primary hover:underline"
                    >
                      {collaboration.company.name}
                    </Link>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Unbekannt
                    </span>
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Influencer
                </dt>
                <dd className="text-sm">
                  {collaboration.assigned_influencer?.full_name || (
                    <span className="italic text-muted-foreground">
                      Nicht zugewiesen
                    </span>
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Deadline
                </dt>
                <dd
                  className={
                    overdue
                      ? "flex items-center gap-1 text-sm text-destructive font-medium"
                      : "text-sm"
                  }
                >
                  {collaboration.deadline ? (
                    <>
                      {overdue && <AlertCircle className="h-4 w-4" />}
                      {format(
                        parseISO(collaboration.deadline),
                        "dd. MMMM yyyy",
                        { locale: de }
                      )}
                    </>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Keine Deadline gesetzt
                    </span>
                  )}
                </dd>
              </div>
            </div>

            {collaboration.notes && (
              <div className="flex items-start gap-3">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Notizen
                  </dt>
                  <dd className="text-sm whitespace-pre-wrap">
                    {collaboration.notes}
                  </dd>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Erstellt am
                </dt>
                <dd className="text-sm">
                  {format(
                    parseISO(collaboration.created_at),
                    "dd. MMMM yyyy, HH:mm",
                    { locale: de }
                  )}{" "}
                  Uhr
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* Briefing section (placeholder for PROJ-4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Briefing</h2>
            <p className="text-sm text-muted-foreground">
              Noch kein Briefing vorhanden
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">
            Briefing kommt bald
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Die Briefing-Funktion wird in einem zukuenftigen Update
            hinzugefuegt (PROJ-4).
          </p>
        </div>
      </div>

      {/* Edit/Delete dialogs */}
      {isAdmin && (
        <>
          <CollaborationForm
            open={showEditForm}
            onOpenChange={setShowEditForm}
            onSubmit={handleUpdate}
            collaboration={collaboration}
            companies={companies}
            influencers={influencers}
          />

          <DeleteConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            title="Kooperation loeschen"
            description={`Moechten Sie "${collaboration.title}" wirklich loeschen? Zugehoerige Briefings werden ebenfalls geloescht. Diese Aktion kann nicht rueckgaengig gemacht werden.`}
          />
        </>
      )}
    </div>
  );
}
