"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CollaborationWithRelations,
  CollaborationFormValues,
  CollaborationStatus,
  Company,
  UserProfile,
} from "@/lib/types";

interface CollaborationsState {
  collaborations: CollaborationWithRelations[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface CollaborationFilters {
  search: string;
  status: CollaborationStatus | "all" | "overdue";
  companyId: string;
  influencerId: string;
}

const PAGE_SIZE = 25;

export function useCollaborations() {
  const [state, setState] = useState<CollaborationsState>({
    collaborations: [],
    loading: true,
    error: null,
    totalCount: 0,
  });
  const [filters, setFilters] = useState<CollaborationFilters>({
    search: "",
    status: "all",
    companyId: "",
    influencerId: "",
  });
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchCollaborations = useCallback(
    async (
      currentFilters: CollaborationFilters,
      pageNum: number,
      field: string,
      direction: "asc" | "desc"
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabase();

      try {
        let query = supabase
          .from("collaborations")
          .select(
            "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)",
            { count: "exact" }
          );

        // Apply search filter
        if (currentFilters.search.trim()) {
          query = query.ilike("title", `%${currentFilters.search}%`);
        }

        // Apply status filter
        if (
          currentFilters.status !== "all" &&
          currentFilters.status !== "overdue"
        ) {
          query = query.eq("status", currentFilters.status);
        }

        // Apply overdue filter
        if (currentFilters.status === "overdue") {
          query = query
            .lt("deadline", new Date().toISOString())
            .not("status", "in", '("completed","declined")');
        }

        // Apply company filter
        if (currentFilters.companyId) {
          query = query.eq("company_id", currentFilters.companyId);
        }

        // Apply influencer filter
        if (currentFilters.influencerId) {
          query = query.eq(
            "assigned_influencer_id",
            currentFilters.influencerId
          );
        }

        // Apply sorting and pagination
        const { data, error, count } = await query
          .order(field, { ascending: direction === "asc" })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        setState({
          collaborations: (data as CollaborationWithRelations[]) || [],
          loading: false,
          error: null,
          totalCount: count || 0,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Kooperationen konnten nicht geladen werden",
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchCollaborations(filters, page, sortField, sortDirection);
  }, [fetchCollaborations, filters, page, sortField, sortDirection]);

  const createCollaboration = useCallback(
    async (
      values: CollaborationFormValues
    ): Promise<CollaborationWithRelations | null> => {
      const supabase = getSupabase();

      // Get organization_id from user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return null;

      const { data, error } = await supabase
        .from("collaborations")
        .insert({
          organization_id: profile.organization_id,
          title: values.title,
          company_id: values.company_id,
          assigned_influencer_id: values.assigned_influencer_id || null,
          status: values.status || "requested",
          deadline: values.deadline || null,
          notes: values.notes || null,
        })
        .select(
          "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCollaborations(filters, page, sortField, sortDirection);
      return data as CollaborationWithRelations;
    },
    [fetchCollaborations, filters, page, sortField, sortDirection]
  );

  const updateCollaboration = useCallback(
    async (
      id: string,
      values: Partial<CollaborationFormValues>
    ): Promise<CollaborationWithRelations | null> => {
      const supabase = getSupabase();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (values.title !== undefined) updateData.title = values.title;
      if (values.company_id !== undefined)
        updateData.company_id = values.company_id;
      if (values.assigned_influencer_id !== undefined)
        updateData.assigned_influencer_id =
          values.assigned_influencer_id || null;
      if (values.status !== undefined) updateData.status = values.status;
      if (values.deadline !== undefined)
        updateData.deadline = values.deadline || null;
      if (values.notes !== undefined) updateData.notes = values.notes || null;

      const { data, error } = await supabase
        .from("collaborations")
        .update(updateData)
        .eq("id", id)
        .select(
          "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCollaborations(filters, page, sortField, sortDirection);
      return data as CollaborationWithRelations;
    },
    [fetchCollaborations, filters, page, sortField, sortDirection]
  );

  const updateStatus = useCallback(
    async (
      id: string,
      status: CollaborationStatus
    ): Promise<CollaborationWithRelations | null> => {
      return updateCollaboration(id, { status });
    },
    [updateCollaboration]
  );

  const deleteCollaboration = useCallback(
    async (id: string): Promise<boolean> => {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("collaborations")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCollaborations(filters, page, sortField, sortDirection);
      return true;
    },
    [fetchCollaborations, filters, page, sortField, sortDirection]
  );

  const totalPages = Math.ceil(state.totalCount / PAGE_SIZE);

  return {
    ...state,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    createCollaboration,
    updateCollaboration,
    updateStatus,
    deleteCollaboration,
    refresh: () =>
      fetchCollaborations(filters, page, sortField, sortDirection),
  };
}

// Hook for a single collaboration detail
export function useCollaborationDetail(collaborationId: string) {
  const [collaboration, setCollaboration] =
    useState<CollaborationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchCollaboration = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();

    try {
      const { data, error: fetchError } = await supabase
        .from("collaborations")
        .select(
          "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
        )
        .eq("id", collaborationId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setCollaboration(data as CollaborationWithRelations);
      setLoading(false);
    } catch {
      setError("Kooperation konnte nicht geladen werden");
      setLoading(false);
    }
  }, [collaborationId]);

  useEffect(() => {
    if (collaborationId) {
      fetchCollaboration();
    }
  }, [collaborationId, fetchCollaboration]);

  return {
    collaboration,
    loading,
    error,
    refresh: fetchCollaboration,
  };
}

// Hook for fetching filter options (companies + influencers)
export function useCollaborationOptions() {
  const [companies, setCompanies] = useState<Pick<Company, "id" | "name">[]>(
    []
  );
  const [influencers, setInfluencers] = useState<
    Pick<UserProfile, "id" | "user_id" | "full_name">[]
  >([]);
  const [loading, setLoading] = useState(true);

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    async function fetchOptions() {
      const supabase = getSupabase();

      const [companiesResult, influencersResult] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name")
          .order("name", { ascending: true })
          .limit(500),
        supabase
          .from("user_profiles")
          .select("id, user_id, full_name")
          .eq("role", "influencer")
          .order("full_name", { ascending: true })
          .limit(500),
      ]);

      if (companiesResult.data) {
        setCompanies(companiesResult.data);
      }

      if (influencersResult.data) {
        setInfluencers(influencersResult.data);
      }

      setLoading(false);
    }

    fetchOptions();
  }, []);

  return { companies, influencers, loading };
}
