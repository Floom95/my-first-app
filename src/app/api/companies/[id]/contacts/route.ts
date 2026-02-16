import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { contactFormSchema } from "@/lib/types";

// GET /api/companies/[id]/contacts - List contacts for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
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

    // Verify the company exists and user has access (RLS handles org scoping)
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Unternehmen nicht gefunden" },
        { status: 404 }
      );
    }

    // Fetch contacts for this company - RLS handles org scoping
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: "Fehler beim Laden der Ansprechpartner" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/contacts - Create a contact for a company
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
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
        { error: "Nur Agency Admins können Ansprechpartner hinzufügen" },
        { status: 403 }
      );
    }

    // Verify the company exists and user has access
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Unternehmen nicht gefunden" },
        { status: 404 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, position, email, phone } = parsed.data;

    // Insert contact
    const { data: contact, error: insertError } = await supabase
      .from("contacts")
      .insert({
        company_id: companyId,
        name,
        position: position || null,
        email,
        phone: phone || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Ansprechpartners" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
