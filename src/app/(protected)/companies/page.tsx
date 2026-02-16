"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, ChevronLeft, ChevronRight } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCompanies } from "@/hooks/use-companies";
import type { CompanyFormValues } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanyForm } from "@/components/companies/company-form";

export default function CompaniesPage() {
  const { isAdmin } = useAuth();
  const {
    companies,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalCount,
    createCompany,
    checkDuplicateName,
  } = useCompanies();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(debouncedSearch);
      setPage(0); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, setSearch, setPage]);

  async function handleCreate(values: CompanyFormValues) {
    return createCompany(values);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unternehmen</h1>
          <p className="text-muted-foreground">
            {totalCount > 0
              ? `${totalCount} Unternehmen insgesamt`
              : "Verwalten Sie Ihre Unternehmenspartner"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Unternehmen
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name oder Branche..."
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {search
              ? "Keine Ergebnisse"
              : "Noch keine Unternehmen vorhanden"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {search
              ? `Keine Unternehmen gefunden fuer "${search}". Versuchen Sie einen anderen Suchbegriff.`
              : isAdmin
              ? "Legen Sie Ihr erstes Unternehmen an, um loszulegen."
              : "Noch keine Unternehmen in Ihrer Organisation."}
          </p>
          {!search && isAdmin && (
            <Button
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Erstes Unternehmen anlegen
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Companies grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Seite {page + 1} von {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Zurueck
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Weiter
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create company dialog */}
      {isAdmin && (
        <CompanyForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSubmit={handleCreate}
          onCheckDuplicate={checkDuplicateName}
        />
      )}
    </div>
  );
}
