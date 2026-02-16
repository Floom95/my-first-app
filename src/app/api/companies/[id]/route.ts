import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { companyFormSchema } from "@/lib/types";

// GET /api/companies/[id] - Get a single company with contacts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch company with contacts - RLS ensures org scoping
    const { data: company, error } = await supabase
      .from("companies")
      .select("*, contacts(*)")
      .eq("id", id)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { error: "Unternehmen nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Update a company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
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
        { error: "Nur Agency Admins können Unternehmen bearbeiten" },
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

    // Update company - RLS ensures org scoping and admin-only
    const { data: company, error: updateError } = await supabase
      .from("companies")
      .update({
        name,
        industry: industry || null,
        website: website || null,
        notes: notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren des Unternehmens" },
        { status: 500 }
      );
    }

    if (!company) {
      return NextResponse.json(
        { error: "Unternehmen nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
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
        { error: "Nur Agency Admins können Unternehmen löschen" },
        { status: 403 }
      );
    }

    // Delete company - RLS ensures org scoping and admin-only
    // CASCADE will delete associated contacts automatically
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Fehler beim Löschen des Unternehmens" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Unternehmen gelöscht" });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
