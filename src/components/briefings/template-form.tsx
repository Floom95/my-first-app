"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  BriefingTemplate,
  BriefingTemplateFormValues,
} from "@/lib/types";
import { briefingTemplateFormSchema } from "@/lib/types";

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
import { Separator } from "@/components/ui/separator";

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: BriefingTemplateFormValues
  ) => Promise<BriefingTemplate | null>;
  template?: BriefingTemplate | null;
}

export function TemplateForm({
  open,
  onOpenChange,
  onSubmit,
  template,
}: TemplateFormProps) {
  const [saving, setSaving] = useState(false);
  const isEditing = !!template;

  const form = useForm<BriefingTemplateFormValues>({
    resolver: zodResolver(briefingTemplateFormSchema),
    defaultValues: {
      name: template?.name || "",
      campaign_goal: template?.template_data?.campaign_goal || "",
      target_audience: template?.template_data?.target_audience || "",
      deliverables: template?.template_data?.deliverables || "",
      hashtags: template?.template_data?.hashtags || "",
      dos_donts: template?.template_data?.dos_donts || "",
      content_guidelines: template?.template_data?.content_guidelines || "",
      compensation: template?.template_data?.compensation || "",
      notes: template?.template_data?.notes || "",
    },
  });

  // Reset form when template changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: template?.name || "",
        campaign_goal: template?.template_data?.campaign_goal || "",
        target_audience: template?.template_data?.target_audience || "",
        deliverables: template?.template_data?.deliverables || "",
        hashtags: template?.template_data?.hashtags || "",
        dos_donts: template?.template_data?.dos_donts || "",
        content_guidelines: template?.template_data?.content_guidelines || "",
        compensation: template?.template_data?.compensation || "",
        notes: template?.template_data?.notes || "",
      });
    }
  }, [open, template, form]);

  async function handleSubmit(values: BriefingTemplateFormValues) {
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
            {isEditing ? "Template bearbeiten" : "Neues Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aktualisieren Sie die Template-Vorlage."
              : "Erstellen Sie eine wiederverwendbare Briefing-Vorlage."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Template Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Template-Name{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Standard Instagram Kampagne"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

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
                    <FormLabel>Kampagnenziel</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Standard-Kampagnenziel..."
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
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zielgruppe</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Standard-Zielgruppe..."
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
                        placeholder="Standard-Deliverables..."
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
                        placeholder="Standard-Hashtags..."
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
                        placeholder="Standard Do's & Don'ts..."
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
                name="content_guidelines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content-Richtlinien</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Standard Content-Richtlinien..."
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

            {/* Section: Verguetung & Notizen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Verguetung & Notizen
              </h3>

              <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verguetung</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Standard-Verguetung..."
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
                        placeholder="Standard-Notizen..."
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
                  : "Template erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
