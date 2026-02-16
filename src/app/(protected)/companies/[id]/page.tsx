"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Briefcase,
  Pencil,
  Trash2,
  Plus,
  UserPlus,
  StickyNote,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCompanyDetail } from "@/hooks/use-companies";
import { useCompanies } from "@/hooks/use-companies";
import type { CompanyFormValues, ContactFormValues } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/companies/company-form";
import { ContactForm } from "@/components/companies/contact-form";
import { ContactsTable } from "@/components/companies/contacts-table";
import { DeleteConfirmDialog } from "@/components/companies/delete-confirm-dialog";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const { isAdmin } = useAuth();
  const { company, loading, error, addContact, updateContact, deleteContact, refresh } =
    useCompanyDetail(companyId);
  const { updateCompany, deleteCompany, checkDuplicateName } = useCompanies();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleUpdate(values: CompanyFormValues) {
    const result = await updateCompany(companyId, values);
    if (result) {
      refresh();
    }
    return result;
  }

  async function handleDelete() {
    await deleteCompany(companyId);
    router.push("/companies");
  }

  async function handleAddContact(values: ContactFormValues) {
    return addContact(values);
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Uebersicht
        </Link>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            {error || "Unternehmen nicht gefunden"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/companies"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zur Uebersicht
      </Link>

      {/* Company header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {company.name}
            </h1>
            {company.industry && (
              <Badge variant="secondary" className="mt-1">
                {company.industry}
              </Badge>
            )}
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

      {/* Company details card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Unternehmensdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Website
                  </dt>
                  <dd>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </dd>
                </div>
              </div>
            )}

            {company.industry && (
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Branche
                  </dt>
                  <dd className="text-sm">{company.industry}</dd>
                </div>
              </div>
            )}

            {company.notes && (
              <div className="flex items-start gap-3">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Notizen
                  </dt>
                  <dd className="text-sm whitespace-pre-wrap">
                    {company.notes}
                  </dd>
                </div>
              </div>
            )}

            {!company.website && !company.industry && !company.notes && (
              <p className="text-sm text-muted-foreground italic">
                Keine weiteren Details vorhanden.
              </p>
            )}
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* Contacts section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ansprechpartner</h2>
            <p className="text-sm text-muted-foreground">
              {company.contacts.length > 0
                ? `${company.contacts.length} Ansprechpartner`
                : "Noch keine Ansprechpartner"}
            </p>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setShowContactForm(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Hinzufuegen
            </Button>
          )}
        </div>

        <ContactsTable
          contacts={company.contacts}
          isAdmin={isAdmin}
          onUpdate={updateContact}
          onDelete={deleteContact}
        />
      </div>

      {/* Edit company dialog */}
      {isAdmin && (
        <>
          <CompanyForm
            open={showEditForm}
            onOpenChange={setShowEditForm}
            onSubmit={handleUpdate}
            onCheckDuplicate={checkDuplicateName}
            company={company}
          />

          <ContactForm
            open={showContactForm}
            onOpenChange={setShowContactForm}
            onSubmit={handleAddContact}
          />

          <DeleteConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            title="Unternehmen loeschen"
            description={`Moechten Sie "${company.name}" wirklich loeschen? Alle zugehoerigen Ansprechpartner werden ebenfalls geloescht. Diese Aktion kann nicht rueckgaengig gemacht werden.`}
          />
        </>
      )}
    </div>
  );
}
