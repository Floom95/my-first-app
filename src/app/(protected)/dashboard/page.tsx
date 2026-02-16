"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Handshake, FileText, Users, Eye } from "lucide-react";
import { InfluencerDashboard } from "@/components/collaborations/influencer-dashboard";

interface AdminStats {
  companies: number;
  collaborations: number;
  briefings: number;
  members: number;
}

function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    async function fetchStats() {
      const supabase = getSupabase();

      const [companiesRes, collaborationsRes, briefingsRes, membersRes] =
        await Promise.all([
          supabase
            .from("companies")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("collaborations")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("briefings")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("user_profiles")
            .select("id", { count: "exact", head: true }),
        ]);

      setStats({
        companies: companiesRes.count ?? 0,
        collaborations: collaborationsRes.count ?? 0,
        briefings: briefingsRes.count ?? 0,
        members: membersRes.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}

export default function DashboardPage() {
  const { profile, isAdmin, isInfluencer, isBrand } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurueck
          {profile?.full_name ? `, ${profile.full_name}` : ""}!
          {profile?.role && (
            <Badge variant="secondary" className="ml-2">
              {ROLE_LABELS[profile.role]}
            </Badge>
          )}
        </p>
      </div>

      {/* Influencer dashboard */}
      {isInfluencer && <InfluencerDashboard />}

      {/* Admin dashboard */}
      {isAdmin && <AdminDashboard />}

      {/* Brand dashboard */}
      {isBrand && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Ihre Kooperationen
            </CardTitle>
            <CardDescription>
              Uebersicht ueber Kooperationen, an denen Ihr Unternehmen beteiligt ist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Als Unternehmenspartner koennen Sie hier Ihre Kooperationen und
              zugehoerigen Briefings einsehen. Navigieren Sie zu
              &quot;Kooperationen&quot; in der Seitenleiste fuer die vollstaendige
              Uebersicht.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  return (
    <>
      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Unternehmen"
          value={stats?.companies}
          loading={loading}
          icon={Building2}
        />
        <StatCard
          title="Kooperationen"
          value={stats?.collaborations}
          loading={loading}
          icon={Handshake}
        />
        <StatCard
          title="Briefings"
          value={stats?.briefings}
          loading={loading}
          icon={FileText}
        />
        <StatCard
          title="Team-Mitglieder"
          value={stats?.members}
          loading={loading}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitaeten</CardTitle>
          <CardDescription>
            Ueberblick ueber die neuesten Aenderungen in Ihrer Organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine Aktivitaeten vorhanden. Erstellen Sie Ihre erste
            Kooperation, um loszulegen.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon: Icon,
}: {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
