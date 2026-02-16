"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Handshake,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { de } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import {
  useCollaborations,
  useCollaborationOptions,
} from "@/hooks/use-collaborations";
import type { CollaborationStatus, CollaborationWithRelations } from "@/lib/types";
import {
  COLLABORATION_STATUSES,
  STATUS_LABELS,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/collaborations/status-badge";
import { CollaborationForm } from "@/components/collaborations/collaboration-form";

function isOverdue(collaboration: CollaborationWithRelations): boolean {
  if (!collaboration.deadline) return false;
  if (
    collaboration.status === "completed" ||
    collaboration.status === "declined"
  )
    return false;
  return isPast(parseISO(collaboration.deadline));
}

export default function CooperationsPage() {
  const { isAdmin } = useAuth();
  const {
    collaborations,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    totalCount,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    createCollaboration,
    updateStatus,
  } = useCollaborations();

  const { companies, influencers, loading: optionsLoading } =
    useCollaborationOptions();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, setFilters, setPage]);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(0);
  }

  async function handleQuickStatusChange(
    id: string,
    status: CollaborationStatus
  ) {
    try {
      await updateStatus(id, status);
    } catch {
      // Error is handled by the hook state
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kooperationen</h1>
          <p className="text-muted-foreground">
            {totalCount > 0
              ? `${totalCount} Kooperationen insgesamt`
              : "Verwalten Sie Ihre Influencer-Kooperationen"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Kooperation
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche nach Titel..."
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              status: value as CollaborationStatus | "all" | "overdue",
            }));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="overdue">Ueberfaellig</SelectItem>
            {COLLABORATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.companyId || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              companyId: value === "all" ? "" : value,
            }));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Unternehmen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Unternehmen</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.influencerId || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              influencerId: value === "all" ? "" : value,
            }));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Influencer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Influencer</SelectItem>
            {influencers.map((influencer) => (
              <SelectItem key={influencer.user_id} value={influencer.user_id}>
                {influencer.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading || optionsLoading ? (
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Handshake className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {filters.search || filters.status !== "all" || filters.companyId || filters.influencerId
              ? "Keine Ergebnisse"
              : "Noch keine Kooperationen vorhanden"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {filters.search || filters.status !== "all" || filters.companyId || filters.influencerId
              ? "Keine Kooperationen fuer die ausgewaehlten Filter gefunden. Passen Sie die Filter an."
              : isAdmin
              ? "Legen Sie Ihre erste Kooperation an, um loszulegen."
              : "Noch keine Kooperationen in Ihrer Organisation."}
          </p>
          {!filters.search &&
            filters.status === "all" &&
            !filters.companyId &&
            !filters.influencerId &&
            isAdmin && (
              <Button
                className="mt-4"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Erste Kooperation anlegen
              </Button>
            )}
        </div>
      ) : (
        <>
          {/* Collaborations table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => handleSort("title")}
                    >
                      Titel
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => handleSort("deadline")}
                    >
                      Deadline
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborations.map((collab) => {
                  const overdue = isOverdue(collab);
                  return (
                    <TableRow key={collab.id} className="group">
                      <TableCell>
                        <Link
                          href={`/cooperations/${collab.id}`}
                          className="font-medium hover:underline"
                        >
                          {collab.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {collab.company?.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {collab.assigned_influencer?.full_name || (
                          <span className="italic">Nicht zugewiesen</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            value={collab.status}
                            onValueChange={(value) =>
                              handleQuickStatusChange(
                                collab.id,
                                value as CollaborationStatus
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[160px] border-none bg-transparent p-0 hover:bg-accent">
                              <StatusBadge status={collab.status} />
                            </SelectTrigger>
                            <SelectContent>
                              {COLLABORATION_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <StatusBadge status={collab.status} />
                        )}
                      </TableCell>
                      <TableCell>
                        {collab.deadline ? (
                          <span
                            className={
                              overdue
                                ? "flex items-center gap-1 text-destructive font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {overdue && (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {format(
                              parseISO(collab.deadline),
                              "dd.MM.yyyy",
                              { locale: de }
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

      {/* Create collaboration dialog */}
      {isAdmin && (
        <CollaborationForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSubmit={createCollaboration}
          companies={companies}
          influencers={influencers}
        />
      )}
    </div>
  );
}
