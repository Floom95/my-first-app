"use client";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  /** Optional fallback component shown when access is denied */
  fallback?: React.ReactNode;
}

/**
 * RoleGuard protects content based on user roles.
 * Wrap page content or specific sections to restrict access.
 *
 * Usage:
 * <RoleGuard allowedRoles={["agency_admin"]}>
 *   <AdminContent />
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Sie haben keine Berechtigung für diese Aktion. Bitte wenden Sie sich
            an Ihren Administrator, wenn Sie glauben, dass dies ein Fehler ist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
