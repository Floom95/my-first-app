"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CollaborationWithRelations,
  CollaborationStatus,
} from "@/lib/types";

interface DashboardState {
  collaborations: CollaborationWithRelations[];
  loading: boolean;
  error: string | null;
}

export function useInfluencerDashboard() {
  const [state, setState] = useState<DashboardState>({
    collaborations: [],
    loading: true,
    error: null,
  });
  const [statusFilter, setStatusFilter] = useState<
    CollaborationStatus | "all"
  >("all");

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchCollaborations = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from("collaborations")
        .select(
          "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
        )
        .order("deadline", { ascending: true, nullsFirst: false });

      if (error) {
        setState({ collaborations: [], loading: false, error: error.message });
        return;
      }

      setState({
        collaborations: (data as CollaborationWithRelations[]) || [],
        loading: false,
        error: null,
      });
    } catch {
      setState({
        collaborations: [],
        loading: false,
        error: "Kooperationen konnten nicht geladen werden",
      });
    }
  }, []);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const { overdue, upcoming } = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    return {
      overdue: state.collaborations.filter(
        (c) =>
          c.deadline &&
          new Date(c.deadline) < now &&
          c.status !== "completed" &&
          c.status !== "declined"
      ),
      upcoming: state.collaborations.filter(
        (c) =>
          c.deadline &&
          new Date(c.deadline) >= now &&
          new Date(c.deadline) <= sevenDaysFromNow &&
          c.status !== "completed" &&
          c.status !== "declined"
      ),
    };
  }, [state.collaborations]);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? state.collaborations
        : state.collaborations.filter((c) => c.status === statusFilter),
    [state.collaborations, statusFilter]
  );

  return {
    ...state,
    overdue,
    upcoming,
    filtered,
    statusFilter,
    setStatusFilter,
    refresh: fetchCollaborations,
  };
}
