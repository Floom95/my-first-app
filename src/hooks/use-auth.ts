"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Defer Supabase client creation to avoid SSR issues during build
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as UserProfile;
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    const getSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setState({ user: null, profile: null, loading: false, error: null });
          return;
        }

        if (user) {
          const profile = await fetchProfile(user.id);
          setState({ user, profile, loading: false, error: null });
        } else {
          setState({ user: null, profile: null, loading: false, error: null });
        }
      } catch {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: "Sitzung konnte nicht geladen werden",
        });
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          loading: false,
          error: null,
        });
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
    } else {
      // Use window.location.href for post-logout redirect (per frontend rules)
      window.location.href = "/login";
    }
  }, []);

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signOut,
    isAdmin: state.profile?.role === "agency_admin",
    isInfluencer: state.profile?.role === "influencer",
    isBrand: state.profile?.role === "brand",
  };
}
