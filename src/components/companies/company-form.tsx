"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Company, CompanyFormValues } from "@/lib/types";
import { companyFormSchema } from "@/lib/types";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CompanyFormValues) => Promise<Company | null>;
  onCheckDuplicate?: (name: string, excludeId?: string) => Promise<boolean>;
  company?: Company | null;
}

export function CompanyForm({
  open,
  onOpenChange,
  onSubmit,
  onCheckDuplicate,
  company,
}: CompanyFormProps) {
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [pendingValues, setPendingValues] = useState<CompanyFormValues | null>(
    null
  );

  const isEditing = !!company;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name || "",
      industry: company?.industry || "",
      website: company?.website || "",
      notes: company?.notes || "",
    },
  });

  async function handleSubmit(values: CompanyFormValues) {
    // Check for duplicate name
    if (onCheckDuplicate) {
      const isDuplicate = await onCheckDuplicate(
        values.name,
        company?.id
      );
      if (isDuplicate) {
        setPendingValues(values);
        setDuplicateWarning(true);
        return;
      }
    }

    await performSubmit(values);
  }

  async function performSubmit(values: CompanyFormValues) {
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

  function handleDuplicateConfirm() {
    setDuplicateWarning(false);
    if (pendingValues) {
      performSubmit(pendingValues);
      setPendingValues(null);
    }
  }

  function handleDuplicateCancel() {
    setDuplicateWarning(false);
    setPendingValues(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Unternehmen bearbeiten" : "Neues Unternehmen"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Aktualisieren Sie die Unternehmensdaten."
                : "Legen Sie ein neues Unternehmen an."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Unternehmensname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branche</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Mode, Technik, Food" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                    <FormLabel>Notizen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Weitere Informationen zum Unternehmen..."
                        className="resize-none"
                        rows={3}
                        {...field}
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

      {/* Duplicate name warning */}
      <AlertDialog open={duplicateWarning} onOpenChange={setDuplicateWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplikat gefunden</AlertDialogTitle>
            <AlertDialogDescription>
              Ein Unternehmen mit diesem Namen existiert bereits. Moechten Sie
              das Unternehmen trotzdem anlegen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              Trotzdem anlegen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
