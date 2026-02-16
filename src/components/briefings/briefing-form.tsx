"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import type {
  Briefing,
  BriefingFormValues,
  BriefingTemplate,
} from "@/lib/types";
import { briefingFormSchema } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface BriefingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BriefingFormValues) => Promise<Briefing | null>;
  briefing?: Briefing | null;
  templates?: BriefingTemplate[];
}

export function BriefingForm({
  open,
  onOpenChange,
  onSubmit,
  briefing,
  templates = [],
}: BriefingFormProps) {
  const [saving, setSaving] = useState(false);
  const isEditing = !!briefing;

  const form = useForm<BriefingFormValues>({
    resolver: zodResolver(briefingFormSchema),
    defaultValues: {
      campaign_goal: briefing?.campaign_goal || "",
      target_audience: briefing?.target_audience || "",
      deliverables: briefing?.deliverables || "",
      hashtags: briefing?.hashtags || "",
      dos_donts: briefing?.dos_donts || "",
      content_guidelines: briefing?.content_guidelines || "",
      posting_period_start: briefing?.posting_period_start
        ? format(new Date(briefing.posting_period_start), "yyyy-MM-dd")
        : "",
      posting_period_end: briefing?.posting_period_end
        ? format(new Date(briefing.posting_period_end), "yyyy-MM-dd")
        : "",
      compensation: briefing?.compensation || "",
      notes: briefing?.notes || "",
    },
  });

  // Reset form when briefing changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        campaign_goal: briefing?.campaign_goal || "",
        target_audience: briefing?.target_audience || "",
        deliverables: briefing?.deliverables || "",
        hashtags: briefing?.hashtags || "",
        dos_donts: briefing?.dos_donts || "",
        content_guidelines: briefing?.content_guidelines || "",
        posting_period_start: briefing?.posting_period_start
          ? format(new Date(briefing.posting_period_start), "yyyy-MM-dd")
          : "",
        posting_period_end: briefing?.posting_period_end
          ? format(new Date(briefing.posting_period_end), "yyyy-MM-dd")
          : "",
        compensation: briefing?.compensation || "",
        notes: briefing?.notes || "",
      });
    }
  }, [open, briefing, form]);

  function handleTemplateSelect(templateId: string) {
    if (templateId === "none") return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const data = template.template_data;
    if (data.campaign_goal) form.setValue("campaign_goal", data.campaign_goal);
    if (data.target_audience)
      form.setValue("target_audience", data.target_audience);
    if (data.deliverables) form.setValue("deliverables", data.deliverables);
    if (data.hashtags) form.setValue("hashtags", data.hashtags);
    if (data.dos_donts) form.setValue("dos_donts", data.dos_donts);
    if (data.content_guidelines)
      form.setValue("content_guidelines", data.content_guidelines);
    if (data.compensation) form.setValue("compensation", data.compensation);
    if (data.notes) form.setValue("notes", data.notes);
  }

  async function handleSubmit(values: BriefingFormValues) {
    setSaving(true);
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      form.setError("root", { message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Briefing bearbeiten" : "Briefing erstellen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aktualisieren Sie die Briefing-Informationen."
              : "Erstellen Sie ein detailliertes Briefing fuer diese Kooperation."}
          </DialogDescription>
        </DialogHeader>

        {/* Template selection (only when creating) */}
        {!isEditing && templates.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Vorlage verwenden</label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Template auswaehlen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Separator className="mt-4" />
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Section: Ziele & Zielgruppe */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Ziele & Zielgruppe
              </h3>

              <FormField
                control={form.control}
                name="campaign_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kampagnenziel{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Was soll mit der Kampagne erreicht werden?"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zielgruppe</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Welche Zielgruppe soll angesprochen werden?"
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Section: Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Content
              </h3>

              <FormField
                control={form.control}
                name="deliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deliverables</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="z.B. 3 Instagram Posts, 2 Stories, 1 Reel"
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hashtags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hashtags & Mentions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="#hashtag1 #hashtag2 @mention"
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dos_donts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do&apos;s & Don&apos;ts</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Was soll/darf gemacht werden und was nicht?"
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_guidelines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content-Richtlinien</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Stilrichtung, Bildsprache, Tonalitaet..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Section: Timeline & Verguetung */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Timeline & Verguetung
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="posting_period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posting-Zeitraum Start</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="posting_period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posting-Zeitraum Ende</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verguetung</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. 500 EUR + Produkte"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zusaetzliche Notizen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Weitere wichtige Informationen..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Wird gespeichert..."
                  : isEditing
                  ? "Speichern"
                  : "Briefing erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
