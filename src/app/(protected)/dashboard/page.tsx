"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Handshake, FileText, Users } from "lucide-react";

export default function DashboardPage() {
  const { profile, isAdmin, isInfluencer } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurück
          {profile?.full_name ? `, ${profile.full_name}` : ""}!
          {profile?.role && (
            <Badge variant="secondary" className="ml-2">
              {ROLE_LABELS[profile.role]}
            </Badge>
          )}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unternehmen
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Wird nach Backend-Setup angezeigt
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kooperationen
            </CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Wird nach Backend-Setup angezeigt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Briefings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Wird nach Backend-Setup angezeigt
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team-Mitglieder
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Wird nach Backend-Setup angezeigt
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role-specific content */}
      {isInfluencer && (
        <Card>
          <CardHeader>
            <CardTitle>Ihre Kooperationen</CardTitle>
            <CardDescription>
              Übersicht über Ihre anstehenden und laufenden Kooperationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noch keine Kooperationen vorhanden. Sobald Ihnen eine Kooperation
              zugewiesen wird, erscheint sie hier.
            </p>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>
              Überblick über die neuesten Änderungen in Ihrer Organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noch keine Aktivitäten vorhanden. Erstellen Sie Ihre erste
              Kooperation, um loszulegen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
