"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function HomePage() {
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login";
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
