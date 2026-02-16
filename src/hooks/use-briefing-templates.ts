"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BriefingTemplate,
  BriefingTemplateFormValues,
  BriefingTemplateData,
} from "@/lib/types";

interface TemplatesState {
  templates: BriefingTemplate[];
  loading: boolean;
  error: string | null;
}

export function useBriefingTemplates() {
  const [state, setState] = useState<TemplatesState>({
    templates: [],
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

  const fetchTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from("briefing_templates")
        .select("*")
        .order("name", { ascending: true })
        .limit(500);

      if (error) {
        setState({ templates: [], loading: false, error: error.message });
        return;
      }

      setState({
        templates: (data as BriefingTemplate[]) || [],
        loading: false,
        error: null,
      });
    } catch {
      setState({
        templates: [],
        loading: false,
        error: "Templates konnten nicht geladen werden",
      });
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(
    async (
      values: BriefingTemplateFormValues
    ): Promise<BriefingTemplate | null> => {
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

      const templateData: BriefingTemplateData = {
        campaign_goal: values.campaign_goal || undefined,
        target_audience: values.target_audience || undefined,
        deliverables: values.deliverables || undefined,
        hashtags: values.hashtags || undefined,
        dos_donts: values.dos_donts || undefined,
        content_guidelines: values.content_guidelines || undefined,
        compensation: values.compensation || undefined,
        notes: values.notes || undefined,
      };

      const { data, error } = await supabase
        .from("briefing_templates")
        .insert({
          organization_id: profile.organization_id,
          name: values.name,
          template_data: templateData,
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await fetchTemplates();
      return data as BriefingTemplate;
    },
    [fetchTemplates]
  );

  const updateTemplate = useCallback(
    async (
      id: string,
      values: BriefingTemplateFormValues
    ): Promise<BriefingTemplate | null> => {
      const supabase = getSupabase();

      const templateData: BriefingTemplateData = {
        campaign_goal: values.campaign_goal || undefined,
        target_audience: values.target_audience || undefined,
        deliverables: values.deliverables || undefined,
        hashtags: values.hashtags || undefined,
        dos_donts: values.dos_donts || undefined,
        content_guidelines: values.content_guidelines || undefined,
        compensation: values.compensation || undefined,
        notes: values.notes || undefined,
      };

      const { data, error } = await supabase
        .from("briefing_templates")
        .update({
          name: values.name,
          template_data: templateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await fetchTemplates();
      return data as BriefingTemplate;
    },
    [fetchTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("briefing_templates")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await fetchTemplates();
      return true;
    },
    [fetchTemplates]
  );

  return {
    ...state,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: fetchTemplates,
  };
}
