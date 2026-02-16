"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Company,
  CompanyWithContacts,
  Contact,
  CompanyFormValues,
  ContactFormValues,
} from "@/lib/types";

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const PAGE_SIZE = 50;

export function useCompanies() {
  const [state, setState] = useState<CompaniesState>({
    companies: [],
    loading: true,
    error: null,
    totalCount: 0,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchCompanies = useCallback(
    async (searchQuery: string, pageNum: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabase();

      try {
        let query = supabase
          .from("companies")
          .select("*", { count: "exact" })
          .order("name", { ascending: true })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (searchQuery.trim()) {
          query = query.or(
            `name.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`
          );
        }

        const { data, error, count } = await query;

        if (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        setState({
          companies: (data as Company[]) || [],
          loading: false,
          error: null,
          totalCount: count || 0,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Unternehmen konnten nicht geladen werden",
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchCompanies(search, page);
  }, [fetchCompanies, search, page]);

  const createCompany = useCallback(
    async (values: CompanyFormValues): Promise<Company | null> => {
      const supabase = getSupabase();

      // Get organization_id from the user's profile
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
        .from("companies")
        .insert({
          organization_id: profile.organization_id,
          name: values.name,
          industry: values.industry || null,
          website: values.website || null,
          notes: values.notes || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCompanies(search, page);
      return data as Company;
    },
    [fetchCompanies, search, page]
  );

  const updateCompany = useCallback(
    async (id: string, values: CompanyFormValues): Promise<Company | null> => {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("companies")
        .update({
          name: values.name,
          industry: values.industry || null,
          website: values.website || null,
          notes: values.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCompanies(search, page);
      return data as Company;
    },
    [fetchCompanies, search, page]
  );

  const deleteCompany = useCallback(
    async (id: string): Promise<boolean> => {
      const supabase = getSupabase();

      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh list
      fetchCompanies(search, page);
      return true;
    },
    [fetchCompanies, search, page]
  );

  const checkDuplicateName = useCallback(
    async (name: string, excludeId?: string): Promise<boolean> => {
      const supabase = getSupabase();

      let query = supabase
        .from("companies")
        .select("id")
        .ilike("name", name)
        .limit(1);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data } = await query;
      return (data?.length || 0) > 0;
    },
    []
  );

  const totalPages = Math.ceil(state.totalCount / PAGE_SIZE);

  return {
    ...state,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    createCompany,
    updateCompany,
    deleteCompany,
    checkDuplicateName,
    refresh: () => fetchCompanies(search, page),
  };
}

// Hook for a single company with its contacts
export function useCompanyDetail(companyId: string) {
  const [company, setCompany] = useState<CompanyWithContacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();

    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("*, contacts(*)")
        .eq("id", companyId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setCompany(data as CompanyWithContacts);
      setLoading(false);
    } catch {
      setError("Unternehmen konnte nicht geladen werden");
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId, fetchCompany]);

  const addContact = useCallback(
    async (values: ContactFormValues): Promise<Contact | null> => {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("contacts")
        .insert({
          company_id: companyId,
          name: values.name,
          position: values.position || null,
          email: values.email,
          phone: values.phone || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      fetchCompany();
      return data as Contact;
    },
    [companyId, fetchCompany]
  );

  const updateContact = useCallback(
    async (
      contactId: string,
      values: ContactFormValues
    ): Promise<Contact | null> => {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("contacts")
        .update({
          name: values.name,
          position: values.position || null,
          email: values.email,
          phone: values.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contactId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      fetchCompany();
      return data as Contact;
    },
    [fetchCompany]
  );

  const deleteContact = useCallback(
    async (contactId: string): Promise<boolean> => {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId);

      if (error) {
        throw new Error(error.message);
      }

      fetchCompany();
      return true;
    },
    [fetchCompany]
  );

  return {
    company,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refresh: fetchCompany,
  };
}
