"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import type {
  CollaborationFormValues,
  CollaborationWithRelations,
  Company,
  UserProfile,
  CollaborationStatus,
} from "@/lib/types";
import {
  collaborationFormSchema,
  COLLABORATION_STATUSES,
  STATUS_LABELS,
} from "@/lib/types";

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

interface CollaborationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: CollaborationFormValues
  ) => Promise<CollaborationWithRelations | null>;
  collaboration?: CollaborationWithRelations | null;
  companies: Pick<Company, "id" | "name">[];
  influencers: Pick<UserProfile, "id" | "user_id" | "full_name">[];
}

export function CollaborationForm({
  open,
  onOpenChange,
  onSubmit,
  collaboration,
  companies,
  influencers,
}: CollaborationFormProps) {
  const [saving, setSaving] = useState(false);

  const isEditing = !!collaboration;

  const form = useForm<CollaborationFormValues>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: {
      title: collaboration?.title || "",
      company_id: collaboration?.company_id || "",
      assigned_influencer_id:
        collaboration?.assigned_influencer_id || undefined,
      status: collaboration?.status || "requested",
      deadline: collaboration?.deadline
        ? format(new Date(collaboration.deadline), "yyyy-MM-dd")
        : undefined,
      notes: collaboration?.notes || "",
    },
  });

  async function handleSubmit(values: CollaborationFormValues) {
    setSaving(true);
    try {
      // Convert date to ISO string for storage
      const submitValues = {
        ...values,
        deadline: values.deadline
          ? new Date(values.deadline).toISOString()
          : undefined,
        assigned_influencer_id:
          values.assigned_influencer_id && values.assigned_influencer_id !== "none"
            ? values.assigned_influencer_id
            : undefined,
        notes: values.notes || undefined,
      };
      await onSubmit(submitValues);
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Kooperation bearbeiten" : "Neue Kooperation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aktualisieren Sie die Kooperationsdaten."
              : "Legen Sie eine neue Kooperation an."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Titel <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Instagram Story Kampagne"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Unternehmen <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unternehmen auswaehlen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_influencer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Influencer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Influencer auswaehlen (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        Kein Influencer zugewiesen
                      </SelectItem>
                      {influencers.map((influencer) => (
                        <SelectItem
                          key={influencer.user_id}
                          value={influencer.user_id}
                        >
                          {influencer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLLABORATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status as CollaborationStatus]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Weitere Details zur Kooperation..."
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
                  : "Anlegen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
