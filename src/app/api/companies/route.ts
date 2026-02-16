import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { companyFormSchema } from "@/lib/types";

// GET /api/companies - List companies with search and pagination
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

    // Get user profile for organization_id
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = (page - 1) * limit;

    // Build query - RLS handles organization filtering
    let query = supabase
      .from("companies")
      .select("*, contacts(count)", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data: companies, error, count } = await query
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Fehler beim Laden der Unternehmen" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      companies,
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

// POST /api/companies - Create a new company
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
        { error: "Nur Agency Admins können Unternehmen anlegen" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = companyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, industry, website, notes } = parsed.data;

    // Check for duplicate names (warn, don't block)
    const { data: existing } = await supabase
      .from("companies")
      .select("id, name")
      .eq("name", name)
      .limit(1);

    const duplicateWarning =
      existing && existing.length > 0
        ? "Ein Unternehmen mit diesem Namen existiert bereits."
        : null;

    // Insert company
    const { data: company, error: insertError } = await supabase
      .from("companies")
      .insert({
        organization_id: profile.organization_id,
        name,
        industry: industry || null,
        website: website || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Unternehmens" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        company,
        ...(duplicateWarning ? { warning: duplicateWarning } : {}),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
