import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { collaborationFormSchema } from "@/lib/types";

// GET /api/collaborations - List collaborations with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const companyId = searchParams.get("company_id") || "";
    const influencerId = searchParams.get("influencer_id") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "25", 10),
      100
    );
    const offset = (page - 1) * limit;
    const sortField = searchParams.get("sort") || "created_at";
    const sortDirection = searchParams.get("direction") || "desc";

    // Build query - RLS handles organization + role-based filtering
    let query = supabase
      .from("collaborations")
      .select(
        "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)",
        { count: "exact" }
      );

    // Apply search filter
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply status filter
    if (status && status !== "all") {
      if (status === "overdue") {
        query = query
          .lt("deadline", new Date().toISOString())
          .not("status", "in", '("completed","declined")');
      } else {
        query = query.eq("status", status);
      }
    }

    // Apply company filter
    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    // Apply influencer filter
    if (influencerId) {
      query = query.eq("assigned_influencer_id", influencerId);
    }

    // Apply sorting and pagination
    const { data: collaborations, error, count } = await query
      .order(sortField, { ascending: sortDirection === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Fehler beim Laden der Kooperationen" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      collaborations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST /api/collaborations - Create a new collaboration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    if (profile.role !== "agency_admin") {
      return NextResponse.json(
        { error: "Nur Agency Admins koennen Kooperationen anlegen" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = collaborationFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ungueltige Eingabe",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, company_id, assigned_influencer_id, status, deadline, notes } =
      parsed.data;

    // Insert collaboration
    const { data: collaboration, error: insertError } = await supabase
      .from("collaborations")
      .insert({
        organization_id: profile.organization_id,
        title,
        company_id,
        assigned_influencer_id: assigned_influencer_id || null,
        status: status || "requested",
        deadline: deadline || null,
        notes: notes || null,
      })
      .select(
        "*, company:companies(id, name), assigned_influencer:user_profiles!collaborations_assigned_influencer_id_fkey(id, user_id, full_name)"
      )
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Fehler beim Erstellen der Kooperation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ collaboration }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
