"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Briefing, BriefingFormValues } from "@/lib/types";

interface BriefingState {
  briefing: Briefing | null;
  loading: boolean;
  error: string | null;
}

export function useBriefing(collaborationId: string) {
  const [state, setState] = useState<BriefingState>({
    briefing: null,
    loading: true,
    error: null,
  });

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchBriefing = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from("briefings")
        .select("*")
        .eq("collaboration_id", collaborationId)
        .maybeSingle();

      if (error) {
        setState({ briefing: null, loading: false, error: error.message });
        return;
      }

      setState({ briefing: data as Briefing | null, loading: false, error: null });
    } catch {
      setState({
        briefing: null,
        loading: false,
        error: "Briefing konnte nicht geladen werden",
      });
    }
  }, [collaborationId]);

  useEffect(() => {
    if (collaborationId) {
      fetchBriefing();
    }
  }, [collaborationId, fetchBriefing]);

  const createBriefing = useCallback(
    async (values: BriefingFormValues): Promise<Briefing | null> => {
      const supabase = getSupabase();

      const insertData: Record<string, unknown> = {
        collaboration_id: collaborationId,
        campaign_goal: values.campaign_goal,
        target_audience: values.target_audience || null,
        deliverables: values.deliverables || null,
        hashtags: values.hashtags || null,
        dos_donts: values.dos_donts || null,
        content_guidelines: values.content_guidelines || null,
        posting_period_start: values.posting_period_start
          ? new Date(values.posting_period_start).toISOString()
          : null,
        posting_period_end: values.posting_period_end
          ? new Date(values.posting_period_end).toISOString()
          : null,
        compensation: values.compensation || null,
        notes: values.notes || null,
      };

      const { data, error } = await supabase
        .from("briefings")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await fetchBriefing();
      return data as Briefing;
    },
    [collaborationId, fetchBriefing]
  );

  const updateBriefing = useCallback(
    async (
      briefingId: string,
      values: BriefingFormValues
    ): Promise<Briefing | null> => {
      const supabase = getSupabase();

      const updateData: Record<string, unknown> = {
        campaign_goal: values.campaign_goal,
        target_audience: values.target_audience || null,
        deliverables: values.deliverables || null,
        hashtags: values.hashtags || null,
        dos_donts: values.dos_donts || null,
        content_guidelines: values.content_guidelines || null,
        posting_period_start: values.posting_period_start
          ? new Date(values.posting_period_start).toISOString()
          : null,
        posting_period_end: values.posting_period_end
          ? new Date(values.posting_period_end).toISOString()
          : null,
        compensation: values.compensation || null,
        notes: values.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("briefings")
        .update(updateData)
        .eq("id", briefingId)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await fetchBriefing();
      return data as Briefing;
    },
    [fetchBriefing]
  );

  const deleteBriefing = useCallback(
    async (briefingId: string): Promise<boolean> => {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("briefings")
        .delete()
        .eq("id", briefingId);

      if (error) {
        throw new Error(error.message);
      }

      await fetchBriefing();
      return true;
    },
    [fetchBriefing]
  );

  return {
    ...state,
    createBriefing,
    updateBriefing,
    deleteBriefing,
    refresh: fetchBriefing,
  };
}
