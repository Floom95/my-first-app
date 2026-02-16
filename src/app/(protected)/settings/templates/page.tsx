"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import { useBriefingTemplates } from "@/hooks/use-briefing-templates";
import type {
  BriefingTemplate,
  BriefingTemplateFormValues,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TemplateForm } from "@/components/briefings/template-form";
import { DeleteConfirmDialog } from "@/components/companies/delete-confirm-dialog";

export default function TemplatesPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useBriefingTemplates();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<BriefingTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] =
    useState<BriefingTemplate | null>(null);

  // Redirect non-admins
  if (!isAdmin) {
    router.push("/dashboard");
    return null;
  }

  async function handleCreate(values: BriefingTemplateFormValues) {
    return createTemplate(values);
  }

  async function handleUpdate(values: BriefingTemplateFormValues) {
    if (!editingTemplate) return null;
    return updateTemplate(editingTemplate.id, values);
  }

  async function handleDelete() {
    if (!deletingTemplate) return;
    await deleteTemplate(deletingTemplate.id);
    setDeletingTemplate(null);
  }

  function getTemplateFieldCount(template: BriefingTemplate): number {
    const data = template.template_data;
    let count = 0;
    if (data.campaign_goal) count++;
    if (data.target_audience) count++;
    if (data.deliverables) count++;
    if (data.hashtags) count++;
    if (data.dos_donts) count++;
    if (data.content_guidelines) count++;
    if (data.compensation) count++;
    if (data.notes) count++;
    return count;
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => router.push("/settings")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zu Einstellungen
      </button>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Briefing-Templates
          </h1>
          <p className="text-muted-foreground">
            {templates.length > 0
              ? `${templates.length} Vorlage${
                  templates.length === 1 ? "" : "n"
                } verfuegbar`
              : "Erstellen Sie wiederverwendbare Briefing-Vorlagen."}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Template
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Noch keine Templates vorhanden
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Erstellen Sie Ihre erste Briefing-Vorlage, um wiederkehrende
            Briefings schneller erstellen zu koennen.
          </p>
          <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Erstes Template erstellen
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const fieldCount = getTemplateFieldCount(template);
            return (
              <Card key={template.id} className="group relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {fieldCount} Feld{fieldCount !== 1 ? "er" : ""}{" "}
                          vordefiniert
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingTemplate(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Loeschen</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview of template fields */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {template.template_data.campaign_goal && (
                      <p className="truncate">
                        Kampagnenziel: {template.template_data.campaign_goal}
                      </p>
                    )}
                    {template.template_data.deliverables && (
                      <p className="truncate">
                        Deliverables: {template.template_data.deliverables}
                      </p>
                    )}
                    {template.template_data.target_audience && (
                      <p className="truncate">
                        Zielgruppe: {template.template_data.target_audience}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(
                        parseISO(template.updated_at),
                        "dd.MM.yyyy",
                        { locale: de }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create template dialog */}
      <TemplateForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreate}
      />

      {/* Edit template dialog */}
      <TemplateForm
        open={!!editingTemplate}
        onOpenChange={(open) => {
          if (!open) setEditingTemplate(null);
        }}
        onSubmit={handleUpdate}
        template={editingTemplate}
      />

      {/* Delete template dialog */}
      <DeleteConfirmDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => {
          if (!open) setDeletingTemplate(null);
        }}
        onConfirm={handleDelete}
        title="Template loeschen"
        description={`Moechten Sie "${
          deletingTemplate?.name || ""
        }" wirklich loeschen? Bestehende Briefings, die aus diesem Template erstellt wurden, bleiben unveraendert.`}
      />
    </div>
  );
}
